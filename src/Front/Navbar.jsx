// ============================================================
// Navbar.jsx
// Rotary-dial inspired circular navbar — fixed top-left corner
//
// KEY CONCEPT — Arc positioning:
//   The circle center is placed exactly at the viewport's
//   top-left corner (0, 0).  Each dot's (x, y) is computed
//   with polar coordinates so they sit *on* the circular edge:
//
//       x = cx + R * cos(angle)
//       y = cy + R * sin(angle)
//
//   The arc spans from ~10° to ~80° (bottom-right quadrant),
//   which is the only part visible on screen.
//   Each dot is also rotated to face outward (tangent to arc).
//
// STRUCTURE:
//   <nav.navbar-anchor>            fixed to (0,0), overflow visible
//     <div.navbar-scene>           contains circle + dots
//       <div.navbar-circle>        glassmorphism circle body
//       <div.navbar-arc-strip>     the glowing visible arc band
//       <canvas.navbar-particles>  ambient micro-particles
//       <a.navbar-item> × 5        each absolutely placed on arc
//         <span.dot-ring>          outer glow ring
//         <span.dot-core>          bright center dot
//         <span.dot-label>         text label (hidden until hover)
//
// FUTURE:
//   • Replace <a href="#id"> with <Link to="/page"> (React Router)
//   • Replace dot spans with SVG icons
// ============================================================

import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

// ─────────────────────────────────────────────────────────────
// CONFIG — tweak these numbers to reshape the entire navbar
// ─────────────────────────────────────────────────────────────
const CFG = {
  // Full circle diameter in px
  diameter: 420,

  // The arc the dots are placed along.
  // 0° = right (3 o'clock), angles go clockwise.
  // We want dots in the bottom-right quadrant that peeks on screen.
  arcStart:  1,    // degrees from 3-o'clock going clockwise
  arcEnd:   89,    // degrees from 3-o'clock going clockwise

  // How far inside the circle edge the dots sit (px from edge)
  dotInset: 28,

  // Outward pop distance when hovered (px)
  dotPopDistance: 14,
};

// Navigation items — edit to add/remove/rename
const NAV_ITEMS = [
  { id: "home",     label: "Home"     },
  { id: "about",    label: "About"    },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "contact",  label: "Contact"  },
];

// ─────────────────────────────────────────────────────────────
// Maths helpers
// ─────────────────────────────────────────────────────────────
const deg2rad = (d) => (d * Math.PI) / 180;

/**
 * Given a normalised t (0..1), return the screen position and
 * outward-facing angle for a dot on the visible arc.
 *
 * Circle center is at (0, 0) — the top-left corner of the viewport.
 * Radius = diameter/2 − dotInset.
 */
function dotPosition(t) {
  const { diameter, arcStart, arcEnd, dotInset } = CFG;
  const R     = diameter / 2 - dotInset;
  const angle = deg2rad(arcStart + t * (arcEnd - arcStart));

  return {
    // Position on circle (center = viewport corner = 0,0)
    x: R * Math.cos(angle),
    y: R * Math.sin(angle),
    // Outward normal angle in degrees (for label direction)
    angleDeg: arcStart + t * (arcEnd - arcStart),
  };
}

// ─────────────────────────────────────────────────────────────
// Micro-particle canvas
// Tiny floating white/dark specs give the arc strip ambient life
// ─────────────────────────────────────────────────────────────
function useArcParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Canvas fills the scene div (same size as the circle)
    const S = CFG.diameter;
    canvas.width  = S;
    canvas.height = S;

    const R_OUTER = S / 2;
    const R_INNER = S / 2 - 56;   // particles stay within the strip band
    const CX = 0, CY = 0;         // center = top-left corner of canvas

    const COUNT = 38;
    // Seed each particle at a random point inside the arc band
    const particles = Array.from({ length: COUNT }, () => {
      const a = deg2rad(CFG.arcStart - 5 + Math.random() * (CFG.arcEnd - CFG.arcStart + 10));
      const r = R_INNER + Math.random() * (R_OUTER - R_INNER);
      return {
        x: CX + r * Math.cos(a),
        y: CY + r * Math.sin(a),
        r: Math.random() * 1.1 + 0.3,
        // Slow tangential drift along the arc
        angle: a,
        radius: r,
        dAngle: (Math.random() - 0.5) * 0.0008,
        dRadius: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.30 + 0.08,
        phase:    Math.random() * Math.PI * 2,
        phaseSpd: Math.random() * 0.018 + 0.004,
      };
    });

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, S, S);

      for (const p of particles) {
        const pulse = Math.sin(p.phase) * 0.18 + 0.82;
        const a     = p.alpha * pulse;
        const light = p.alpha > 0.22;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = light
          ? `rgba(255,255,255,${a})`
          : `rgba(8,8,8,${a * 0.65})`;
        ctx.fill();

        // Drift along arc
        p.angle  += p.dAngle;
        p.radius += p.dRadius;
        p.phase  += p.phaseSpd;

        // Bounce radius within the strip band
        if (p.radius < R_INNER || p.radius > R_OUTER) {
          p.dRadius *= -1;
          p.radius = Math.max(R_INNER, Math.min(R_OUTER, p.radius));
        }
        // Bounce angle within the arc range (with padding)
        const minA = deg2rad(CFG.arcStart - 4);
        const maxA = deg2rad(CFG.arcEnd + 4);
        if (p.angle < minA || p.angle > maxA) {
          p.dAngle *= -1;
          p.angle = Math.max(minA, Math.min(maxA, p.angle));
        }

        p.x = CX + p.radius * Math.cos(p.angle);
        p.y = CY + p.radius * Math.sin(p.angle);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [canvasRef]);
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const particleCanvasRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  useArcParticles(particleCanvasRef);

  const R    = CFG.diameter / 2;          // half-diameter
  const half = CFG.diameter / 2;          // alias for clarity

  return (
    // ── Fixed anchor at exact top-left corner ──────────────
    // overflow:visible lets the circle and dots render
    // outside this box; the viewport clips what we want hidden.
    <nav
      className="navbar-anchor"
      aria-label="Main navigation"
      style={{ width: half + 20, height: half + 20 }}
    >
      {/*
        ── Scene container ─────────────────────────────────
        Square canvas equal to the full circle size.
        Positioned so its top-left is the circle's center.
        All children use absolute coords from that origin.
      */}
      <div
        className="navbar-scene"
        style={{ width: CFG.diameter, height: CFG.diameter }}
      >

        {/* ── Full glassmorphism circle body ─────────────── */}
        <div className="navbar-circle" />

        {/* ── Arc strip — the bright visible rim ────────────
            SVG draws the arc band (annular sector shape)
            that sits along the bottom-right quadrant edge.   */}
        <svg
          className="navbar-arc-svg"
          viewBox={`0 0 ${CFG.diameter} ${CFG.diameter}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Radial gradient: bright at outer edge, fades inward */}
            <radialGradient id="stripGrad" cx="0" cy="0" r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform={`translate(0,0) scale(${R})`}>
              <stop offset="0.82" stopColor="rgba(255,255,255,0.00)" />
              <stop offset="0.90" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="0.96" stopColor="rgba(255,255,255,0.32)" />
              <stop offset="1.00" stopColor="rgba(255,255,255,0.14)" />
            </radialGradient>
            {/* Glow filter for the arc edge */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/*
            Arc strip path — annular sector from arcStart to arcEnd.
            We draw it as: outer arc → inner arc (reversed) → close.
            All coords are relative to circle center = (0, 0).
            Translated to SVG center = (R, R) via transform.
          */}
          <ArcStripPath R={R} filter="url(#arcGlow)" />
        </svg>

        {/* Ambient micro-particles drifting along the arc band */}
        <canvas
          className="navbar-particles-canvas"
          ref={particleCanvasRef}
          width={CFG.diameter}
          height={CFG.diameter}
          aria-hidden="true"
        />

        {/* ── Nav dots — placed on the arc via polar math ───── */}
        {NAV_ITEMS.map((item, i) => {
          // t: 0 = first item, 1 = last item
          const edgePadding = 0.07;
          const t = NAV_ITEMS.length > 1? edgePadding + (i / (NAV_ITEMS.length - 1)) * (1 - edgePadding * 2): 0.5;
          const pos = dotPosition(t);
          const isHovered = hoveredId === item.id;

          // Outward pop direction (unit vector pointing away from center)
          const rad   = deg2rad(pos.angleDeg);
          const popX  = isHovered ? Math.cos(rad) * CFG.dotPopDistance : 0;
          const popY  = isHovered ? Math.sin(rad) * CFG.dotPopDistance : 0;

          // Label sits further outward along the same radial direction.
          // We nudge it 22px outward + small tangential offset for readability.
          const labelOffsetR = 22;
          const lx = Math.cos(rad) * labelOffsetR;
          const ly = Math.sin(rad) * labelOffsetR;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`navbar-item${isHovered ? " navbar-item--hovered" : ""}`}
              aria-label={item.label}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                // Place dot center at computed arc position.
                // pos.x / pos.y are from center=(0,0); add R to get SVG/div coords.
                left: `${R + pos.x}px`,
                top:  `${R + pos.y}px`,
                // Pop outward on hover
                transform: `translate(-50%, -50%) translate(${popX}px, ${popY}px)`,
              }}
            >
              {/* Outer glow ring */}
              <span className="dot-ring" aria-hidden="true" />

              {/* Bright core dot */}
              <span className="dot-core" aria-hidden="true" />

              {/* Label — slides outward from the dot on hover */}
              <span
                className="dot-label"
                style={{
                  // Offset along outward radial + 12px perpendicular nudge
                  '--lx': `${lx + 18}px`,
                  '--ly': `${ly - 6}px`,
                }}
              >
                {item.label}
              </span>
            </a>
          );
        })}

      </div>
      {/* end .navbar-scene */}

    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// ArcStripPath — SVG annular sector
// Draws the bright glowing strip that follows the circle edge
// ─────────────────────────────────────────────────────────────
function ArcStripPath({ R, filter }) {
  const { arcStart, arcEnd } = CFG;
  const OUTER_INSET = 2;    // px inside circle edge for outer arc
  const INNER_INSET = 52;   // px inside circle edge for inner arc (strip width)

  const rOuter = R - OUTER_INSET;
  const rInner = R - INNER_INSET;

  // Add slight padding to arc angles for a smoother look
  const startDeg = arcStart - 3;
  const endDeg   = arcEnd   + 3;

  // Convert to radians
  const s = deg2rad(startDeg);
  const e = deg2rad(endDeg);

  // SVG center (circle center in SVG coords)
  const cx = R, cy = R;

  // Outer arc: start → end
  const ox1 = cx + rOuter * Math.cos(s);
  const oy1 = cy + rOuter * Math.sin(s);
  const ox2 = cx + rOuter * Math.cos(e);
  const oy2 = cy + rOuter * Math.sin(e);

  // Inner arc: end → start (reversed)
  const ix1 = cx + rInner * Math.cos(e);
  const iy1 = cy + rInner * Math.sin(e);
  const ix2 = cx + rInner * Math.cos(s);
  const iy2 = cy + rInner * Math.sin(s);

  const largeArc = endDeg - startDeg > 180 ? 1 : 0;

  const d = [
    `M ${ox1} ${oy1}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${ox2} ${oy2}`,   // outer arc CW
    `L ${ix1} ${iy1}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${ix2} ${iy2}`,   // inner arc CCW
    "Z",
  ].join(" ");

  return (
    <g filter={filter}>
      {/* Fill with radial gradient */}
      <path d={d} fill="url(#stripGrad)" />
      {/* Bright outer edge line */}
      <path
        d={`M ${ox1} ${oy1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${ox2} ${oy2}`}
        fill="none"
        stroke="rgba(255,255,255,0.40)"
        strokeWidth="1.2"
      />
      {/* Softer inner edge line */}
      <path
        d={`M ${ix2} ${iy2} A ${rInner} ${rInner} 0 ${largeArc} 1 ${ix1} ${iy1}`}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="0.8"
      />
    </g>
  );
}
