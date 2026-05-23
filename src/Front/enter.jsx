// ============================================================
// Enter.jsx
// "Enter Portfolio" CTA button for the hero landing screen.
//
// DESIGN:
//   Capsule-shaped anchor with a thin white border, translucent
//   fill, and a very soft glow ring (::before pseudo-element).
//   Hover lifts the button 3px upward. Active press scales down.
//   All motion is smooth — no spring bounce, no aggressive easing.
//
// REVEAL:
//   The button is hidden by default (opacity: 0 in CSS).
//   It becomes visible when the parent (HeroText.jsx) adds the
//   "visible" class to the .enter-wrap div via the passed ref.
//   This keeps the reveal timing centrally controlled in HeroText.
//
// USAGE:
//   <Enter btnRef={enterRef} />
//   where enterRef is a useRef() created in HeroText.jsx.
//   HeroText.jsx then calls: enterRef.current.classList.add("visible")
//   at the right moment (after tagline has faded in).
//
// FUTURE:
//   Replace the <a href="#about"> with <Link to="/about"> when
//   React Router is added. The className/ref props stay the same.
// ============================================================

import "./Enter.css";
import { Link } from "react-router-dom";
// ─────────────────────────────────────────────────────────────
// Enter component
//
// Props:
//   btnRef  {React.RefObject}  — ref attached to the outer wrapper
//                                so the parent can add .visible
// ─────────────────────────────────────────────────────────────
export default function Enter({ btnRef }) {
  return (
    // ── Outer positioning wrapper ────────────────────────────
    // Absolutely positioned inside .herotext-wrap.
    // JS in HeroText.jsx adds .visible to trigger the fade-in.
    // pointer-events: none on this wrapper — the button itself
    // re-enables them so the click target is only the button.
    <div
      className="enter-wrap"
      ref={btnRef}
      aria-hidden="false"
    >

      {/* ── The button / anchor ──────────────────────────────
          href="#about" scrolls to the About section.
          TODO: Replace with React Router <Link to="/about">
          once routing is implemented.                          */}
      <Link
        to="/about"
        className="enter-btn"
        aria-label="Enter Portfolio — navigate to About section"
      >

        {/* Button label text
            Wrapped in a span so CSS can target it independently
            for color/shadow transitions without affecting padding */}
        <span className="enter-text">Enter Portfolio</span>

      </Link>

    </div>
  );
}