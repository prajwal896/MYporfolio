// ============================================================
// HeroText.jsx
// Cinematic particle-based name reveal — "Prajwal Adaki"
//
// ── LAYOUT SYSTEM (read this before editing) ────────────────
//
//   The page has TWO separate layers that must stay in sync:
//
//   LAYER A — Canvas (z:10)
//     The particle name is drawn on a fullscreen canvas.
//     Its vertical position is controlled by:
//       CFG.textCenterY  (fraction of viewport height, e.g. 0.38)
//     Its font size is controlled by:
//       CFG.fontSize     (fixed px value — NOT responsive fraction)
//
//   LAYER B — Text block DOM (z:11)
//     The tagline, description, and Enter button are normal HTML.
//     They live inside .herotext-textblock, which is positioned
//     using a CSS variable --text-block-top in HeroText.css.
//     This must visually sit BELOW the canvas name.
//
//   RULE: If you change CFG.textCenterY or CFG.fontSize,
//   you MUST also update --text-block-top in HeroText.css
//   so the DOM block stays below the particle name.
//
//   CURRENT CALIBRATION:
//     name at 38% vertical, font 160px
//     text block starts at 57% vertical
//     gap between name bottom and text block ≈ 60px
//
// ── ANIMATION PHASES ────────────────────────────────────────
//   "dormant"    0–1600ms    nothing drawn
//   "scattered"  1600ms+     particles float randomly
//   "converging" 3000ms+     particles spring toward text shape
//   "formed"     6200ms+     particles hold shape, drift alive,
//                            cursor repulsion active
//
// ── REVEAL SEQUENCE ─────────────────────────────────────────
//   6200ms  particles fully formed
//   6800ms  tagline fades in       (tFormed + 600)
//   7400ms  description fades in   (tFormed + 1200)
//   8000ms  Enter button fades in  (tFormed + 1800)
// ============================================================

import { useEffect, useRef } from "react";
import "./HeroText.css";
import Enter from "./Enter";

// ─────────────────────────────────────────────────────────────
// ██████████████████████████████████████████████████████████
//  CFG — THE SINGLE PLACE TO TUNE EVERYTHING
//  Edit these values first before touching anything else.
// ██████████████████████████████████████████████████████████
// ─────────────────────────────────────────────────────────────
const CFG = {

  // ── Text content ────────────────────────────────────────
  name:    "Prajwal Adaki",
  tagline: "Full Stack Developer  •  Creative Builder",

  // ── Font used for particle sampling ─────────────────────
  // Must match the @import font in HeroText.css
  fontFamily: "'Cormorant Garamond', 'Cinzel', serif",

  // ╔══════════════════════════════════════════════════════╗
  // ║  PARTICLE NAME APPEARANCE — EDIT THESE FREELY        ║
  // ╚══════════════════════════════════════════════════════╝

  // CHANGE THIS TO MAKE THE NAME BOLDER / THINNER
  // "300" = thin/light  "400" = regular  "600" = semi-bold  "700" = bold
  // Heavier weight = thicker strokes = more particles sampled
  fontWeight: "700",

  // CHANGE THIS TO INCREASE / DECREASE NAME SIZE (in pixels)
  // This is the exact font size used when sampling particle positions.
  // Bigger number = bigger name = more particles = denser look.
  // Recommended range: 120–200px. Default: 160px.
  fontSize: 130,

  // CHANGE THIS TO MOVE THE NAME UP OR DOWN ON SCREEN
  // 0.0 = top of screen, 1.0 = bottom. 0.38 = slightly above center.
  // NOTE: If you change this, also update --text-block-top in HeroText.css
  textCenterY: 0.42,

  // CHANGE THIS TO MOVE THE NAME LEFT OR RIGHT
  // 0.5 = perfectly centered. Leave this alone unless you want offset.
  textCenterX: 0.50,

  // CHANGE THIS TO INCREASE / DECREASE PARTICLE DENSITY
  // This is the pixel gap between sampled points.
  // LOWER number = MORE particles = DENSER, heavier text (more CPU)
  // HIGHER number = FEWER particles = lighter, airier text
  // Recommended range: 3 (dense) to 7 (light). Default: 4.
  sampleGap: 3,

  // CHANGE THIS TO CONTROL INDIVIDUAL PARTICLE DOT SIZE
  // Each particle's radius is randomized between min and max (pixels).
  // To make ALL particles the same size, set both to the same value.
  // Bigger radius = thicker, chunkier dots = heavier visual weight.
  coreRadiusMin: 0.6,   // CHANGE THIS: minimum dot radius in px
  coreRadiusMax: 0.9,   // CHANGE THIS: maximum dot radius in px

  // CHANGE THIS TO CONTROL THE GLOW SIZE AROUND EACH PARTICLE
  // haloMultiplier: outer soft glow radius = core radius × this
  // midMultiplier:  inner glow radius = core radius × this
  // Bigger = softer, more diffuse glow. Smaller = tighter, sharper.
  haloMultiplier: 7.0,  // CHANGE THIS: outer halo size
  midMultiplier:  3.5,  // CHANGE THIS: inner glow size

  // ── Particle physics (fine-tuning — usually leave alone) ─
  scatter: {
    springK:  0.025,
    damping:  0.88,
    driftAmp: 0.30,
  },
  converge: {
    springK: 0.055,
    damping:  0.82,
  },
  formed: {
    springK:  0.10,
    damping:  0.78,
    driftAmp: 0.008,
    driftSpd: 0.0002,
  },

  // ── Cursor interaction ───────────────────────────────────
  repelRadius:             70,   // px radius of cursor influence zone
  repelStrength:          3.2,   // how hard particles get pushed
  proximityBrightnessBoost: 0.55, // how much brighter near-cursor particles get

  // ── Phase timings (ms) ───────────────────────────────────
  tScattered:  1600,
  tConverging: 3000,
  tFormed:     6200,
};
// ─────────────────────────────────────────────────────────────
// END OF CFG
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// sampleTextPoints
// Draws the name onto an offscreen canvas using CFG values,
// then reads every non-transparent pixel as a particle target.
// ─────────────────────────────────────────────────────────────
function sampleTextPoints(W, H) {
  const off    = document.createElement("canvas");
  off.width    = W;
  off.height   = H;
  const oc     = off.getContext("2d");

  // Uses CFG.fontSize directly — no responsive scaling here.
  // This keeps the particle density visually consistent across reloads.
  oc.font          = `${CFG.fontWeight} ${CFG.fontSize}px ${CFG.fontFamily}`;
  oc.fillStyle     = "#ffffff";
  oc.textAlign     = "center";
  oc.textBaseline  = "middle";
  oc.fillText(CFG.name, W * CFG.textCenterX, H * CFG.textCenterY);

  const data = oc.getImageData(0, 0, W, H).data;
  const pts  = [];
  const GAP  = CFG.sampleGap; // controlled by CFG — see comments above

  for (let y = 0; y < H; y += GAP) {
    for (let x = 0; x < W; x += GAP) {
      if (data[(y * W + x) * 4 + 3] > 100) {
        pts.push({ x, y });
      }
    }
  }
  return pts;
}


// ─────────────────────────────────────────────────────────────
// buildParticles
// Creates live particle objects from target positions.
// Each starts at a random scatter position on screen.
// ─────────────────────────────────────────────────────────────
function buildParticles(targets, W, H) {
  return targets.map((t) => ({
    tx: t.x,
    ty: t.y,
    sx: Math.random() * W,
    sy: Math.random() * H,
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    // Radius randomized between CFG min/max for natural variation
    r:  CFG.coreRadiusMin + Math.random() * (CFG.coreRadiusMax - CFG.coreRadiusMin),
    phase:    Math.random() * Math.PI * 2,
    phaseSpd: 0.006 + Math.random() * 0.018,
    brightness: 1.0,
  }));
}


// ─────────────────────────────────────────────────────────────
// useParticleEngine — main animation hook (DO NOT EDIT)
// Controls: scatter → converge → form → alive drift + repulsion
// ─────────────────────────────────────────────────────────────
function useParticleEngine(canvasRef) {
  const S = useRef({
    particles: [],
    phase:     "dormant",
    mouse:     { x: -9999, y: -9999 },
    raf:       null,
    timers:    [],
    W: 0,
    H: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const st  = S.current;

    const resize = () => {
      st.W = canvas.width  = window.innerWidth;
      st.H = canvas.height = window.innerHeight;
      if (st.phase !== "dormant") {
        const targets = sampleTextPoints(st.W, st.H);
        targets.forEach((t, i) => {
          if (st.particles[i]) {
            st.particles[i].tx = t.x;
            st.particles[i].ty = t.y;
          }
        });
        if (targets.length > st.particles.length) {
          st.particles.push(...buildParticles(
            targets.slice(st.particles.length), st.W, st.H
          ));
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => { st.mouse = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const schedulePhase = (phase, delay) => {
      const id = setTimeout(() => {
        st.phase = phase;
        if (phase === "scattered") {
          const targets  = sampleTextPoints(st.W, st.H);
          st.particles   = buildParticles(targets, st.W, st.H);
        }
      }, delay);
      st.timers.push(id);
    };

    schedulePhase("scattered",  CFG.tScattered);
    schedulePhase("converging", CFG.tConverging);
    schedulePhase("formed",     CFG.tFormed);

    const draw = (ts) => {
      const { W, H, phase, mouse, particles } = st;

      if (phase === "dormant") {
        ctx.clearRect(0, 0, W, H);
        st.raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        if (phase === "scattered") {
          p.vx += (Math.random() - 0.5) * CFG.scatter.driftAmp;
          p.vy += (Math.random() - 0.5) * CFG.scatter.driftAmp;
          p.vx *= CFG.scatter.damping;
          p.vy *= CFG.scatter.damping;
          if (p.x < 40)      p.vx += 0.08;
          if (p.x > W - 40)  p.vx -= 0.08;
          if (p.y < 40)      p.vy += 0.08;
          if (p.y > H - 40)  p.vy -= 0.08;
        }

        if (phase === "converging") {
          p.vx += (p.tx - p.x) * CFG.converge.springK;
          p.vy += (p.ty - p.y) * CFG.converge.springK;
          p.vx *= CFG.converge.damping;
          p.vy *= CFG.converge.damping;
        }

        if (phase === "formed") {
          p.vx += Math.sin(p.phase + ts * CFG.formed.driftSpd) * CFG.formed.driftAmp;
          p.vy += Math.cos(p.phase + ts * CFG.formed.driftSpd * 0.7) * CFG.formed.driftAmp;

          const dx   = p.x - mouse.x;
          const dy   = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CFG.repelRadius && dist > 0.5) {
            const t     = 1 - dist / CFG.repelRadius;
            const force = t * t * CFG.repelStrength;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.brightness = 1.0 + t * CFG.proximityBrightnessBoost;
          } else {
            p.brightness += (1.0 - p.brightness) * 0.08;
          }

          p.vx += (p.tx - p.x) * CFG.formed.springK;
          p.vy += (p.ty - p.y) * CFG.formed.springK;
          p.vx *= CFG.formed.damping;
          p.vy *= CFG.formed.damping;
        }

        p.x  += p.vx;
        p.y  += p.vy;
        p.phase += p.phaseSpd;

        const glowAmt    = (Math.sin(p.phase) * 0.25 + 0.80) * p.brightness;
        const clampedGlow = Math.min(glowAmt, 1.4);

        const hR   = p.r * CFG.haloMultiplier;
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hR);
        halo.addColorStop(0,   `rgba(210, 228, 255, ${clampedGlow * 0.22})`);
        halo.addColorStop(0.5, `rgba(200, 220, 255, ${clampedGlow * 0.07})`);
        halo.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, hR, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        const mR  = p.r * CFG.midMultiplier;
        const mid = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, mR);
        mid.addColorStop(0,   `rgba(230, 240, 255, ${clampedGlow * 0.55})`);
        mid.addColorStop(0.6, `rgba(210, 228, 255, ${clampedGlow * 0.18})`);
        mid.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, mR, 0, Math.PI * 2);
        ctx.fillStyle = mid;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(255, 255, 255, ${Math.min(clampedGlow, 1)})`;
        ctx.shadowColor = "rgba(200, 220, 255, 0.80)";
        ctx.shadowBlur  = 6;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      st.raf = requestAnimationFrame(draw);
    };

    st.raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(st.raf);
      st.timers.forEach(clearTimeout);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}


// ─────────────────────────────────────────────────────────────
// Reveal hooks — staggered fade-in sequence
// Each adds .visible to its element at the right moment.
//
// CHANGE THE DELAYS HERE if you want elements to appear
// earlier or later relative to when particles finish forming.
//   tFormed = 6200ms (when particles lock into text shape)
//   + 600ms  → tagline appears
//   + 1200ms → description appears
//   + 1800ms → Enter button appears
// ─────────────────────────────────────────────────────────────
function useRevealSequence(taglineRef, descRef, enterRef) {
  useEffect(() => {
    const timers = [
      setTimeout(() => taglineRef.current?.classList.add("visible"), CFG.tFormed + 600),
      setTimeout(() => descRef.current?.classList.add("visible"),    CFG.tFormed + 1200),
      setTimeout(() => enterRef.current?.classList.add("visible"),   CFG.tFormed + 1800),
    ];
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}


// ─────────────────────────────────────────────────────────────
// HeroText component
// ─────────────────────────────────────────────────────────────
export default function HeroText() {
  const canvasRef  = useRef(null);
  const taglineRef = useRef(null);
  const descRef    = useRef(null);
  const enterRef   = useRef(null);

  useParticleEngine(canvasRef);
  useRevealSequence(taglineRef, descRef, enterRef);

  return (
    <div className="herotext-wrap">

      {/* ── Layer A: fullscreen particle canvas ─────────────
          Name drawn at CFG.textCenterY from the top.
          Transparent background — shows gradient beneath.    */}
      <canvas
        className="herotext-canvas"
        ref={canvasRef}
        aria-hidden="true"
      />

      {/* ── Layer B: text block ──────────────────────────────
          Positioned below the particle name via --text-block-top
          in HeroText.css. All three elements share one container
          so their spacing is relative to each other — not to
          the viewport. This is the ONE layout system.

          Vertical order:
            .herotext-tagline     ← main role description
            .herotext-description ← supporting sentence
            <Enter />             ← CTA button
      */}
      <div className="herotext-textblock">

        {/* Main tagline — appears first after name forms */}
        <p
          className="herotext-tagline"
          ref={taglineRef}
          aria-live="polite"
        >
          {CFG.tagline}
        </p>

        {/* Supporting description — appears second */}
        <p
          className="herotext-description"
          ref={descRef}
        >
          Creating immersive and functional web experiences through modern full-stack development.
        </p>

        {/* Enter Portfolio CTA — appears last */}
        {/* btnRef is the .enter-wrap div in Enter.jsx */}
        <Enter btnRef={enterRef} />

      </div>

    </div>
  );
}