import React, { useEffect, useRef } from 'react';
import './background.css';

function Background() {
  const particleContainerRef = useRef(null);

  useEffect(() => {
    const container = particleContainerRef.current;
    if (!container) return;

    // Clear any existing particles (useful in dev strict mode)
    container.innerHTML = '';

    const PARTICLE_COUNT = 200;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('span');
      particle.classList.add('bg-particle');

      // Random horizontal position across full width
      const left = Math.random() * 100;
      // Random vertical start position
      const top = Math.random() * 100;
      // Random size between 1px and 3.5px
      const size = 1 + Math.random() * 2;
      // Random animation duration between 18s and 40s
      const duration = 18 + Math.random() * 22;
      // Random delay so particles don't all start together
      const delay = -(Math.random() * 40);
      // Random opacity for depth effect
      const opacity = 0.25 + Math.random() * 0.55;
      // Slight horizontal drift amount
      const driftX = (Math.random() - 0.5) * 60;

      particle.style.cssText = `
        left: ${left}%;
        top: ${top}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${opacity};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        --drift-x: ${driftX}px;
      `;

      container.appendChild(particle);
    }
  }, []);

  return (
    /*
     * Root background wrapper — fullscreen fixed layer.
     * Everything inside is purely decorative / atmospheric.
     */
    <div className="bg-root" aria-hidden="true">

      {/* ── Layer 1: Base cinematic gradient ── */}
      <div className="bg-gradient" />

      {/* ── Layer 2: Smoke / fog overlay ── */}
      <div className="bg-smoke">
        <div className="bg-smoke__blob bg-smoke__blob--a" />
        <div className="bg-smoke__blob bg-smoke__blob--b" />
        <div className="bg-smoke__blob bg-smoke__blob--c" />
      </div>

      {/* ── Layer 3: Floating golden particles (injected via JS) ── */}
      <div className="bg-particles" ref={particleContainerRef} />

    </div>
  );
}

export default Background;
