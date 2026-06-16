// ============================================================
// About.jsx
// Cinematic two-column About section.
//
// LAYOUT:
//   Left side  — label, heading, paragraph, pills
//   Right side — image with parallax glow
//
// MOUSE PARALLAX:
//   Image and glow blob move slightly on mouse move.
//   Controls: imageMove and glowMove constants below.
//
// TO ADD YOUR REAL IMAGE:
//   1. Place your image in src/assets/ (e.g. prajwal.png)
//   2. import myPhoto from "../assets/prajwal.png";
//   3. Replace the placeholder <div> with <img src={myPhoto} ... />
// ============================================================

import { useEffect, useRef, useState } from "react";
import {
  Code2,
  Braces,
  FileCode,
  Palette,
  Server,
  Layers,
  Database,
  BadgeCheck,
} from "lucide-react";
import "./about.css";
import myPhoto from "../assets/prajwal.png"

// ─────────────────────────────────────────────────────────────
// TECH STACK — edit this array to add/remove/rename items.
// icon  : any Lucide icon component
// name  : label shown inside the pill
// ─────────────────────────────────────────────────────────────
const techItems = [
  { icon: Code2, name: "React" },
  { icon: Braces, name: "JavaScript" },
  { icon: FileCode, name: "HTML5" },
  { icon: Palette, name: "CSS3" },
  { icon: Server, name: "Node.js" },
  { icon: Layers, name: "Express.js" },
  { icon: Database, name: "MongoDB" },
  { icon: BadgeCheck, name: "GitHub" },
  
];

// ─────────────────────────────────────────────────────────────
// PARALLAX STRENGTH — change these to control movement amount.
// Higher number = image moves more on mouse move.
// Keep both low for a subtle cinematic feel.
// imageMove: how far the image shifts (px per viewport half)
// glowMove : how far the glow blob shifts (slightly more for depth)
// ─────────────────────────────────────────────────────────────
const imageMove = 12;  // CHANGE THIS to increase/decrease image parallax
const glowMove  = 20;  // CHANGE THIS to increase/decrease glow parallax

export default function About() {
  // Tracks smoothed mouse offset from screen center (-1 to 1 range)
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Raw target and smoothed value refs for lerp loop
  const targetRef  = useRef({ x: 0, y: 0 });
  const smoothRef  = useRef({ x: 0, y: 0 });
  const rafRef     = useRef(null);
  const sectionRef = useRef(null);

  // ── Mouse tracking + lerp loop ──────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      // Normalize to -1 … +1 relative to viewport center
      targetRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Lerp toward target every frame so movement is smooth
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      smoothRef.current.x = lerp(smoothRef.current.x, targetRef.current.x, 0.06);
      smoothRef.current.y = lerp(smoothRef.current.y, targetRef.current.y, 0.06);
      setMouse({ ...smoothRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Scroll-based reveal ──────────────────────────────────
  // Adds .visible to .about-section when it enters the viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Compute parallax offsets ─────────────────────────────
  // image and glow each get a slightly different offset for depth
  const imgX  = mouse.x * imageMove;
  const imgY  = mouse.y * imageMove;
  const gloX  = mouse.x * glowMove;
  const gloY  = mouse.y * glowMove;

  return (
    // Main section wrapper — scroll target for IntersectionObserver
    <section className="about-section" id="about" ref={sectionRef}>

      {/* Subtle vertical accent line on the far left */}
      <div className="about-accent-line" aria-hidden="true" />

      {/* ── Left side — all text content ─────────────────── */}
      <div className="about-left">

        {/* Small label above heading */}
        <span className="about-label">About Me</span>

        {/* Big cinematic heading
            CHANGE THIS TEXT in JSX directly.
            CHANGE SIZE via --heading-size in About.css :root  */}
        <h2 className="about-heading">
          I build modern websites <br />
          for brands, <br />
          creators, and startups.
        </h2>

        {/* Main paragraph
            CHANGE line-height via --para-line-height in About.css */}
        <p className="about-para">
          I'm a full-stack web developer focused on creating cinematic,
          modern, and interactive digital experiences. I enjoy blending
          cinematic design with functional development while 
          exploring MERN stack and creative frontend engineering.
        </p>

        {/* Currently exploring line */}
        <p className="about-exploring" id ="techstack">
        Tech Stack</p>

        {/* Tech stack pills
            ADD/REMOVE pills by editing the techItems array above.
            CHANGE pill style via .about-pill rules in About.css    */}
        <div className="about-pills">
          {techItems.map((tech) => (
            <span className="about-pill" key={tech.name}>
              {/* Icon — swap by changing icon in techItems array */}
              <tech.icon className="pill-icon" aria-hidden="true" />
              <span className="pill-name">{tech.name}</span>
            </span>
          ))}
        </div>

      </div>
      {/* end left side */}

      {/* ── Right side — image + glow ─────────────────────── */}
      <div className="about-right">

        {/* Ambient radial glow behind image
            CHANGE glow color via --glow-color in About.css :root
            CHANGE glow size  via --glow-size  in About.css :root  */}
        <div
          className="about-glow"
          aria-hidden="true"
          style={{ transform: `translate(${gloX}px, ${gloY}px)` }}
        />

        {/* Fog vignette layer behind image for depth */}
        <div className="about-fog" aria-hidden="true" />

        {/* Image wrapper — parallax container
            Replace the inner placeholder div with your real <img> tag.
            See instructions at the top of this file.                  */}
        <div
          className="about-image-wrap"
          style={{ transform: `translate(${imgX}px, ${imgY}px)` }}
        >
          {
              <img
                src={myPhoto}
                alt="Prajwal Adaki"
                className="about-image"
                draggable="false"
              />
          }
          

          {/* Soft vignette at image bottom edge for blending */}
          <div className="about-image-fade" aria-hidden="true" />
        </div>

      </div>
      {/* end right side */}

    </section>
  );
}
