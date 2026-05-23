// ============================================================
// FogLayer.jsx
// Ultra-subtle cinematic atmospheric fog overlay.
//
// WHAT THIS COMPONENT DOES:
//   Renders 4 large blurred gradient divs that drift slowly
//   across the screen via CSS animations.
//   A lightweight JS mouse handler adds a tiny parallax offset
//   per layer so closer layers react more than distant ones —
//   reinforcing cinematic depth.
//
// WHAT THIS COMPONENT DOES NOT DO:
//   No canvas. No particle engine. No heavy libraries.
//   All movement is CSS transform (GPU composited).
//
// Z-INDEX POSITION IN THE STACK:
//   Background  z:0  →  FogLayer  z:5  →  HeroText  z:10  →  Navbar  z:900
//
// HOW TO IMPORT (in App.jsx or First.jsx):
//   import FogLayer from "./components/FogLayer/FogLayer";
//   ...
//   <Background />
//   <FogLayer />      ← between Background and HeroText
//   <HeroText />
//   <Navbar />
// ============================================================

import { useEffect, useRef } from "react";
import "./FogLayer.css";

// ─────────────────────────────────────────────────────────────
// PARALLAX CONFIG
// Each layer has a multiplier that controls how much it shifts
// in response to mouse movement.
// Higher = moves more = feels "closer" to the viewer.
// Keep values small — this effect should be barely perceptible.
// ─────────────────────────────────────────────────────────────
const PARALLAX = [
  { ref: null, xFactor: 0.006, yFactor: 0.004 },  // Layer 1 — barely moves
  { ref: null, xFactor: 0.010, yFactor: 0.007 },  // Layer 2 — slight mid shift
  { ref: null, xFactor: 0.016, yFactor: 0.011 },  // Layer 3 — most responsive
  { ref: null, xFactor: 0.004, yFactor: 0.003 },  // Layer 4 — almost static
];

// ─────────────────────────────────────────────────────────────
// useMouseParallax
// Attaches a mousemove listener to the window.
// On each move it calculates the offset from screen center
// and nudges each fog layer's CSS custom properties --px / --py.
// These custom properties are read inside the CSS keyframes
// so the parallax is additive with the drift animation.
// ─────────────────────────────────────────────────────────────
function useMouseParallax(layerRefs) {
  useEffect(() => {
    // Center of the screen — parallax is measured from here
    let cx = window.innerWidth  / 2;
    let cy = window.innerHeight / 2;

    // Recalculate center if viewport resizes
    const onResize = () => {
      cx = window.innerWidth  / 2;
      cy = window.innerHeight / 2;
    };
    window.addEventListener("resize", onResize);

    // Smoothed current position (lerped toward raw mouse)
    // Lerping avoids jittery jumps on fast mouse movement
    let smoothX = 0;
    let smoothY = 0;
    let targetX = 0;
    let targetY = 0;
    let raf     = null;

    // Lerp loop — runs independently of mousemove events
    // so the fog always eases smoothly even when mouse stops
    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      smoothX = lerp(smoothX, targetX, 0.04);   // 0.04 = very slow ease
      smoothY = lerp(smoothY, targetY, 0.04);

      // Apply nudge to each layer via CSS custom properties
      layerRefs.forEach((entry) => {
        if (!entry.ref?.current) return;
        const px = smoothX * entry.xFactor;
        const py = smoothY * entry.yFactor;
        entry.ref.current.style.setProperty("--px", `${px}px`);
        entry.ref.current.style.setProperty("--py", `${py}px`);
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // Update target on mouse move — offset from screen center
    const onMove = (e) => {
      targetX = e.clientX - cx;
      targetY = e.clientY - cy;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [layerRefs]);
}

// ─────────────────────────────────────────────────────────────
// FogLayer component
// ─────────────────────────────────────────────────────────────
export default function FogLayer() {
  // Create a ref for each layer so the parallax hook can
  // set CSS custom properties directly on the DOM elements
  const l1 = useRef(null);
  const l2 = useRef(null);
  const l3 = useRef(null);
  const l4 = useRef(null);

  // Attach refs to the parallax config array
  // (done here rather than at module level so refs are stable)
  const layerRefs = [
    { ...PARALLAX[0], ref: l1 },
    { ...PARALLAX[1], ref: l2 },
    { ...PARALLAX[2], ref: l3 },
    { ...PARALLAX[3], ref: l4 },
  ];

  useMouseParallax(layerRefs);

  return (
    // fog-container: fixed fullscreen, pointer-events none, z-index 5
    <div className="fog-container" aria-hidden="true">

      {/* ── Layer 1 — Deep low ground fog ─────────────────────
          Warm red tint, slowest drift, anchored near bottom.
          Blends with the red gradient at the bottom of the bg.  */}
      <div className="fog-puff fog-l1" ref={l1} />

      {/* ── Layer 2 — Mid-screen drift ─────────────────────────
          Cooler dark hue, medium speed, drifts leftward.
          Gives the mid-screen area atmospheric volume.           */}
      <div className="fog-puff fog-l2" ref={l2} />

      {/* ── Layer 3 — Upper wisp ───────────────────────────────
          Faintest layer, lives in upper area.
          Barely visible — just enough to add depth.
          Most mouse-responsive of the four layers.              */}
      <div className="fog-puff fog-l3" ref={l3} />

      {/* ── Layer 4 — Wide ambient veil ────────────────────────
          Full-width, nearly static presence.
          Ties the other layers together into a unified mood.
          Slowest animation — almost just "breathes."            */}
      <div className="fog-puff fog-l4" ref={l4} />

    </div>
  );
}
