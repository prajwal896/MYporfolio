// ============================================================
// Services.jsx
// 3-card rotating carousel — center card is always "active".
//
// HOW THE CAROUSEL WORKS:
//   We track which card is in the "center" slot using activeIndex.
//   Each card's visual position (left / center / right) is
//   determined by computing its offset from activeIndex.
//   Clicking a side card rotates the order.
//
// SLOT POSITIONS (visual slots, not card indices):
//   slot -1 = left  (slightly behind, dimmed, scaled down)
//   slot  0 = center (bright, full scale, in front)
//   slot +1 = right  (slightly behind, dimmed, scaled down)
// ============================================================

import { useState, useRef, useEffect } from "react";
import "./services.css";

// ─────────────────────────────────────────────────────────────
// LAYOUT CONFIG
// Tweak these values to adjust the carousel layout.
// All values are in pixels unless noted.
// ─────────────────────────────────────────────────────────────
const LAYOUT = {
  // How far left/right the side cards shift from center
  // INCREASE to show more of the side cards
  // DECREASE to push them further behind center
  sideShift: 220,           // px — CHANGE THIS to move side cards in/out

  // How much the whole carousel group shifts horizontally
  // 0 = perfectly centered in the section
  // positive = shifts right, negative = shifts left
  groupOffsetX: 0,          // px — CHANGE THIS to reposition entire group

  // How much the whole carousel shifts vertically from center
  // 0 = vertically centered, positive = moves down
  groupOffsetY: 0,          // px — CHANGE THIS to nudge group up/down

  // Scale of the center (active) card — 1.0 = full size
  centerScale: 1.0,         // CHANGE THIS: 1.05 makes center slightly bigger

  // Scale of the left and right (side) cards
  // DECREASE to make side cards feel more "behind"
  sideScale: 0.82,          // CHANGE THIS: controls side card shrink amount

  // Brightness of side cards (0 = black, 1 = full brightness)
  // DECREASE for more dramatic depth separation
  sideBrightness: 0.45,     // CHANGE THIS: controls how dimmed side cards are

  // How much the side cards overlap behind center (z-index is fixed,
  // this affects how much they "peek out" from behind)
  // Controlled by sideShift above — less shift = more hidden

  // Transition speed for card movement (CSS transition duration in ms)
  // INCREASE for slower, more cinematic transitions
  // DECREASE for snappier feel
  transitionMs: 600,        // CHANGE THIS: animation speed in milliseconds

  // Easing curve — controls the feel of the animation
  // Options: "ease", "ease-in-out", "cubic-bezier(...)"
  easing: "cubic-bezier(0.22, 1, 0.36, 1)", // CHANGE THIS: animation easing
};

// ─────────────────────────────────────────────────────────────
// CARD DATA
// Edit the content here. Add more cards only if updating
// the carousel logic to support more than 3.
// ─────────────────────────────────────────────────────────────
const cards = [
  {
    id: 1,
    tag: "01",
    title: "Brand Websites",
    description:
      "Modern websites designed to build a strong online presence.",
    points: [
      "Portfolio websites",
      "Business landing pages",
      "Strong first impressions",
      "Modern user experience",
      "Mobile-friendly design",
      "Builds brand trust",
    ],
    cta: "Build Your Website",
  },
  {
    id: 2,
    tag: "02",
    title: "Web Applications",
    description:
      "Interactive websites built for functionality and seamless user experience.",
    points: [
      "User login systems",
      "Custom dashboards",
      "Forms & data handling",
      "Backend integration",
      "Fast responsive interface",
      "Custom-built features",
    ],
    cta: "Discuss Your Idea",
  },
  {
    id: 3,
    tag: "03",
    title: "Client Acquisition Systems",
    description:
      "Websites designed to help businesses attract and convert more clients.",
    points: [
      "Lead collection forms",
      "WhatsApp integration",
      "Appointment systems",
      "Inquiry management",
      "Conversion-focused layouts",
      "Client-focused experience",
    ],
    cta: "Grow Your Business",
  },
];

// ─────────────────────────────────────────────────────────────
// getSlot — returns -1, 0, or 1 for a card's visual position
// relative to the current activeIndex.
// This is what decides: am I left, center, or right?
// ─────────────────────────────────────────────────────────────
function getSlot(cardIndex, activeIndex, total) {
  // Offset: how many steps away from active (wraps around)
  let offset = cardIndex - activeIndex;
  // Wrap: for 3 cards, offset can only be -1, 0, or 1
  if (offset > Math.floor(total / 2))  offset -= total;
  if (offset < -Math.floor(total / 2)) offset += total;
  return offset; // -1 = left, 0 = center, 1 = right
}

// ─────────────────────────────────────────────────────────────
// CARD VISUALS
// SVG illustrations drawn inline — no image files needed.
// Each visual matches its card's theme using dark red tones.
// All are self-contained SVGs that blend with the card glass.
//
// TO SWAP FOR A REAL IMAGE LATER:
//   Replace the <svg>...</svg> block with:
//   <img src={yourImage} alt="" className="card-visual-img" />
//   and add .card-visual-img styles matching .card-visual-svg
// ─────────────────────────────────────────────────────────────

// Card 1 — Brand Websites: elegant browser mockup with dark UI
function VisualBrandWebsite() {
  return (
    <svg className="card-visual-svg" viewBox="0 0 280 118" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="0" y="0" width="280" height="118" rx="10" fill="rgba(20,6,4,0.75)" />
      {/* Top bar */}
      <rect x="0" y="0" width="280" height="26" rx="10" fill="rgba(255,255,255,0.05)" />
      <rect x="10" y="10" width="7" height="7" rx="3.5" fill="rgba(255,80,60,0.45)" />
      <rect x="22" y="10" width="7" height="7" rx="3.5" fill="rgba(255,180,40,0.30)" />
      <rect x="34" y="10" width="7" height="7" rx="3.5" fill="rgba(80,200,80,0.25)" />
      {/* URL bar */}
      <rect x="54" y="9" width="172" height="9" rx="4" fill="rgba(255,255,255,0.06)" />
      <rect x="60" y="12" width="60" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      {/* Hero section */}
      <rect x="12" y="32" width="256" height="48" rx="4" fill="rgba(120,20,12,0.22)" />
      {/* Headline lines */}
      <rect x="22" y="41" width="90" height="6" rx="3" fill="rgba(255,255,255,0.55)" />
      <rect x="22" y="51" width="68" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      {/* CTA pill */}
      <rect x="22" y="60" width="52" height="12" rx="6" fill="rgba(160,30,15,0.60)" stroke="rgba(255,80,50,0.25)" strokeWidth="0.8" />
      <rect x="32" y="63" width="32" height="3" rx="1.5" fill="rgba(255,200,180,0.60)" />
      {/* Decorative abstract image box */}
      <rect x="160" y="34" width="96" height="44" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
      <ellipse cx="208" cy="56" rx="22" ry="16" fill="rgba(140,25,12,0.28)" />
      <rect x="190" y="48" width="36" height="2" rx="1" fill="rgba(255,255,255,0.12)" />
      <rect x="196" y="52" width="24" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
      {/* Nav bar links */}
      <rect x="12" y="86" width="256" height="1" fill="rgba(255,255,255,0.05)" />
      <rect x="12" y="92" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.14)" />
      <rect x="58" y="92" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" />
      <rect x="92" y="92" width="34" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" />
      <rect x="132" y="92" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" />
      {/* Card grid */}
      <rect x="12" y="100" width="78" height="10" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
      <rect x="96" y="100" width="78" height="10" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
      <rect x="180" y="100" width="78" height="10" rx="3" fill="rgba(120,20,12,0.18)" stroke="rgba(160,30,15,0.20)" strokeWidth="0.6" />
      {/* Ambient red glow */}
      <ellipse cx="140" cy="60" rx="110" ry="50" fill="rgba(140,25,12,0.08)" />
    </svg>
  );
}

// Card 2 — Web Applications: analytics dashboard UI
function VisualWebApp() {
  return (
    <svg className="card-visual-svg" viewBox="0 0 280 118" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background */}
      <rect x="0" y="0" width="280" height="118" rx="10" fill="rgba(14,4,3,0.80)" />
      {/* Sidebar */}
      <rect x="0" y="0" width="44" height="118" rx="8" fill="rgba(255,255,255,0.04)" />
      <rect x="10" y="14" width="24" height="4" rx="2" fill="rgba(255,255,255,0.20)" />
      <rect x="10" y="28" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.10)" />
      <rect x="10" y="36" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.07)" />
      <rect x="10" y="44" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.07)" />
      <rect x="10" y="52" width="24" height="3" rx="1.5" fill="rgba(160,30,15,0.60)" />
      <rect x="10" y="60" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.07)" />
      {/* Top row stat cards */}
      <rect x="52" y="8" width="52" height="28" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
      <rect x="58" y="14" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      <rect x="58" y="20" width="30" height="6" rx="2" fill="rgba(255,255,255,0.32)" />
      <rect x="110" y="8" width="52" height="28" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
      <rect x="116" y="14" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      <rect x="116" y="20" width="30" height="6" rx="2" fill="rgba(160,30,15,0.70)" />
      <rect x="168" y="8" width="52" height="28" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
      <rect x="174" y="14" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      <rect x="174" y="20" width="30" height="6" rx="2" fill="rgba(255,255,255,0.22)" />
      <rect x="226" y="8" width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.7" />
      <rect x="232" y="14" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      <rect x="232" y="20" width="26" height="6" rx="2" fill="rgba(255,255,255,0.18)" />
      {/* Chart area */}
      <rect x="52" y="42" width="148" height="50" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.7" />
      {/* Chart grid lines */}
      <line x1="60" y1="82" x2="192" y2="82" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
      <line x1="60" y1="72" x2="192" y2="72" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
      <line x1="60" y1="62" x2="192" y2="62" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
      {/* Chart bars */}
      <rect x="66"  y="70" width="12" height="12" rx="2" fill="rgba(160,30,15,0.70)" />
      <rect x="83"  y="62" width="12" height="20" rx="2" fill="rgba(160,30,15,0.55)" />
      <rect x="100" y="66" width="12" height="16" rx="2" fill="rgba(160,30,15,0.45)" />
      <rect x="117" y="58" width="12" height="24" rx="2" fill="rgba(160,30,15,0.75)" />
      <rect x="134" y="63" width="12" height="19" rx="2" fill="rgba(160,30,15,0.50)" />
      <rect x="151" y="56" width="12" height="26" rx="2" fill="rgba(200,50,20,0.80)" />
      <rect x="168" y="61" width="12" height="21" rx="2" fill="rgba(160,30,15,0.55)" />
      {/* Chart line overlay */}
      <polyline points="72,74 89,66 106,70 123,62 140,67 157,59 174,64" fill="none" stroke="rgba(255,120,80,0.55)" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Mini list on right */}
      <rect x="206" y="42" width="64" height="50" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.7" />
      <rect x="212" y="50" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      <rect x="212" y="58" width="28" height="2.5" rx="1" fill="rgba(255,255,255,0.10)" />
      <rect x="212" y="64" width="32" height="2.5" rx="1" fill="rgba(255,255,255,0.08)" />
      <rect x="212" y="70" width="24" height="2.5" rx="1" fill="rgba(160,30,15,0.60)" />
      <rect x="212" y="76" width="30" height="2.5" rx="1" fill="rgba(255,255,255,0.08)" />
      {/* Ambient glow */}
      <ellipse cx="140" cy="70" rx="100" ry="44" fill="rgba(130,20,10,0.07)" />
    </svg>
  );
}

// Card 3 — Client Acquisition: lead funnel + chat flow visual
function VisualLeadFunnel() {
  return (
    <svg className="card-visual-svg" viewBox="0 0 280 118" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background */}
      <rect x="0" y="0" width="280" height="118" rx="10" fill="rgba(12,3,2,0.82)" />
      {/* ── Left: funnel diagram ── */}
      {/* Funnel layer 1 — top/widest */}
      <path d="M 20 16 L 110 16 L 98 36 L 32 36 Z" fill="rgba(160,30,15,0.45)" stroke="rgba(200,50,20,0.25)" strokeWidth="0.7" />
      <rect x="34" y="22" width="60" height="3" rx="1.5" fill="rgba(255,255,255,0.30)" />
      {/* Funnel layer 2 */}
      <path d="M 32 40 L 98 40 L 86 56 L 44 56 Z" fill="rgba(140,25,12,0.38)" stroke="rgba(180,40,18,0.22)" strokeWidth="0.7" />
      <rect x="50" y="45" width="42" height="3" rx="1.5" fill="rgba(255,255,255,0.22)" />
      {/* Funnel layer 3 — narrow */}
      <path d="M 44 60 L 86 60 L 78 76 L 52 76 Z" fill="rgba(120,20,10,0.50)" stroke="rgba(160,30,15,0.28)" strokeWidth="0.7" />
      <rect x="56" y="65" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      {/* Funnel bottom — conversion */}
      <path d="M 52 80 L 78 80 L 72 96 L 58 96 Z" fill="rgba(200,50,20,0.60)" stroke="rgba(255,80,40,0.35)" strokeWidth="0.7" />
      <rect x="58" y="86" width="14" height="3" rx="1.5" fill="rgba(255,220,200,0.55)" />
      {/* Funnel % labels on right */}
      <rect x="114" y="22" width="20" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
      <rect x="114" y="44" width="16" height="4" rx="2" fill="rgba(255,255,255,0.14)" />
      <rect x="114" y="64" width="12" height="4" rx="2" fill="rgba(255,255,255,0.10)" />
      <rect x="114" y="84" width="10" height="4" rx="2" fill="rgba(200,80,40,0.70)" />
      {/* Divider */}
      <line x1="148" y1="10" x2="148" y2="108" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      {/* ── Right: WhatsApp-style chat bubbles ── */}
      {/* Incoming bubble 1 */}
      <rect x="156" y="14" width="90" height="18" rx="8" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />
      <rect x="164" y="19" width="48" height="3" rx="1.5" fill="rgba(255,255,255,0.30)" />
      <rect x="164" y="25" width="32" height="2.5" rx="1" fill="rgba(255,255,255,0.15)" />
      {/* Outgoing bubble (brand red) */}
      <rect x="164" y="38" width="82" height="18" rx="8" fill="rgba(140,25,12,0.55)" stroke="rgba(180,40,18,0.30)" strokeWidth="0.7" />
      <rect x="172" y="43" width="54" height="3" rx="1.5" fill="rgba(255,200,180,0.45)" />
      <rect x="172" y="49" width="34" height="2.5" rx="1" fill="rgba(255,160,130,0.28)" />
      {/* Incoming bubble 2 */}
      <rect x="156" y="62" width="90" height="18" rx="8" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />
      <rect x="164" y="67" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.28)" />
      <rect x="164" y="73" width="60" height="2.5" rx="1" fill="rgba(255,255,255,0.14)" />
      {/* Appointment card */}
      <rect x="156" y="86" width="116" height="24" rx="7" fill="rgba(160,30,15,0.30)" stroke="rgba(200,50,20,0.28)" strokeWidth="0.8" />
      <rect x="164" y="92" width="36" height="3" rx="1.5" fill="rgba(255,220,200,0.50)" />
      <rect x="164" y="98" width="24" height="2.5" rx="1" fill="rgba(255,180,150,0.30)" />
      <rect x="216" y="90" width="48" height="12" rx="5" fill="rgba(200,50,20,0.55)" />
      <rect x="224" y="94" width="32" height="3" rx="1.5" fill="rgba(255,220,200,0.60)" />
      {/* Ambient glow */}
      <ellipse cx="200" cy="65" rx="70" ry="40" fill="rgba(140,25,12,0.09)" />
      <ellipse cx="70"  cy="56" rx="55" ry="38" fill="rgba(160,30,15,0.07)" />
    </svg>
  );
}

// Map each card id to its visual component
// TO SWAP A VISUAL: change the component referenced here
const cardVisuals = {
  1: VisualBrandWebsite,
  2: VisualWebApp,
  3: VisualLeadFunnel,
};

// ─────────────────────────────────────────────────────────────
// ServiceCard — renders a single card with position styles
// ─────────────────────────────────────────────────────────────
function ServiceCard({ card, slot, onClick, transitionStyle }) {
  const isCenter = slot === 0;
  const isLeft   = slot === -1;
  const isRight  = slot === 1;

  // Compute transform based on slot
  // slot  0 → center, no shift
  // slot -1 → shift left, scale down
  // slot +1 → shift right, scale down
  const shiftX = slot * LAYOUT.sideShift;
  const scale  = isCenter ? LAYOUT.centerScale : LAYOUT.sideScale;
  const brightness = isCenter ? 1 : LAYOUT.sideBrightness;

  const cardStyle = {
    transform:  `translateX(${shiftX}px) scale(${scale})`,
    filter:     `brightness(${brightness})`,
    zIndex:     isCenter ? 3 : 1,
    // Blur side cards very subtly for depth — 0 = no blur
    // CHANGE this value to increase background-card blur
    backdropFilter: isCenter ? "blur(12px)" : "blur(6px)",
    WebkitBackdropFilter: isCenter ? "blur(12px)" : "blur(6px)",
    cursor:     isCenter ? "default" : "pointer",
    ...transitionStyle,
  };

  return (
    <div
      className={`service-card ${isCenter ? "active" : "side"} ${isLeft ? "left" : ""} ${isRight ? "right" : ""}`}
      style={cardStyle}
      onClick={isCenter ? undefined : onClick}
      aria-label={isCenter ? card.title : `View ${card.title}`}
    >
      {/* Card number tag — top left */}
      <span className="card-tag">{card.tag}</span>

      {/* Title */}
      <h3 className="card-title">{card.title}</h3>

      {/* Visual illustration — sits between title and description.
          Lookup the right component from cardVisuals using card.id.
          TO SWAP: replace the component in the cardVisuals map above. */}
      {(() => {
        const Visual = cardVisuals[card.id];
        return Visual ? (
          <div className="card-visual-wrap" aria-hidden="true">
            <Visual />
          </div>
        ) : null;
      })()}

      {/* Short description */}
      <p className="card-description">{card.description}</p>

      {/* Divider line */}
      <div className="card-divider" />

      {/* Feature points list */}
      <ul className="card-points">
        {card.points.map((point) => (
          <li key={point} className="card-point">
            <span className="point-dot" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

      {/* CTA button — only fully visible/clickable on center card */}
      <div className="card-cta-wrap">
        <button className="card-cta" tabIndex={isCenter ? 0 : -1}>
          {card.cta}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Services — main section component
// ─────────────────────────────────────────────────────────────
export default function Services() {
  // activeIndex: index of the card currently in the center slot
  // Starts at 1 so the middle card (index 1) is active first
  const [activeIndex, setActiveIndex] = useState(1);

  // Tracks if we're mid-transition to prevent rapid double-clicks
  const [animating, setAnimating] = useState(false);

  // Scroll-reveal ref
  const sectionRef = useRef(null);

  // ── Scroll reveal ──────────────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.10 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Rotate carousel ────────────────────────────────────
  // direction: +1 = rotate right (clicking right card)
  //            -1 = rotate left  (clicking left card)
  const rotate = (direction) => {
    if (animating) return;
    setAnimating(true);
    setActiveIndex((prev) => (prev + direction + cards.length) % cards.length);
    // Unlock after transition completes
    setTimeout(() => setAnimating(false), LAYOUT.transitionMs);
  };

  // CSS transition string — built from LAYOUT constants
  // Applied to every card so they all move together
  const transitionStyle = {
    transition: `transform ${LAYOUT.transitionMs}ms ${LAYOUT.easing}, filter ${LAYOUT.transitionMs}ms ease`,
  };

  return (
    <section className="services-section" id="services" ref={sectionRef}>

      {/* ── Section header ──────────────────────────────── */}
      <div className="services-header">
        <h2 className="services-heading">Services</h2>
      </div>

      {/* ── Carousel wrapper ────────────────────────────────
          groupOffsetX/Y nudge the whole group.
          Cards are centered via flex + absolute positioning. */}
      <div
        className="carousel-wrap"
        style={{
          // CHANGE groupOffsetX/Y in LAYOUT config above to reposition
          transform: `translate(${LAYOUT.groupOffsetX}px, ${LAYOUT.groupOffsetY}px)`,
        }}
      >

        {/* The stage holds all 3 cards stacked at the same origin.
            Each card then transforms itself into left/center/right. */}
        <div className="carousel-stage">
          {cards.map((card, i) => {
            const slot = getSlot(i, activeIndex, cards.length);
            return (
              <ServiceCard
                key={card.id}
                card={card}
                slot={slot}
                transitionStyle={transitionStyle}
                onClick={() => rotate(slot)} // slot is +1 or -1 — perfect direction value
              />
            );
          })}
        </div>

        {/* ── Navigation dots ─────────────────────────────
            Shows which card is active. Click to jump directly. */}
        <div className="carousel-dots">
          {cards.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === activeIndex ? "active" : ""}`}
              onClick={() => {
                if (animating || i === activeIndex) return;
                // Determine shortest rotation direction
                const slot = getSlot(i, activeIndex, cards.length);
                rotate(slot);
              }}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}