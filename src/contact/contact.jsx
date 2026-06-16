// ============================================================
// Contact.jsx — Premium Cinematic Contact Section
// Drop-in component — does NOT affect any other section styles
// ============================================================

import React from "react";
import "./Contact.css";

// ── Icon Components (inline SVG — no extra dependencies) ───

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const email = import.meta.env.VITE_EMAIL;

const EMAIL_LINK = email
  ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
  : "mailto:";
const CONTACT_CARDS = [
  {
    id: "instagram", 
    icon: <InstagramIcon />,
    title: "Instagram",
    desc: "DM me for quick discussions.",
    href:`https://www.instagram.com/prxwlll?igsh=MWJ4MzdyYnBzbzh0MA==`, // ← replace
    ariaLabel: "Open Instagram profile",
  },
  {
    
  id: "email",
  icon: <EmailIcon />,
  title: "Email",
  desc: "For project inquiries & collaborations.",
  href: EMAIL_LINK,
  ariaLabel: "Send an email",

  },
  {
    id: "whatsapp",
    icon: <WhatsAppIcon />,
    title: "WhatsApp",
    desc: "Fastest way to reach me.",
    href: `https://wa.me/${import.meta.env.VITE_NUMBER}`,// ← replace with your number e.g. 919876543210
    ariaLabel: "Open WhatsApp chat",
  },
];

// ── Process steps data ─────────────────────────────────────
const PROCESS_STEPS = [
  { number: "01", label: "Discovery" },
  { number: "02", label: "Planning" },
  { number: "03", label: "Design & Dev" },
  { number: "04", label: "Launch" },
];

// ── WhatsApp CTA link ──────────────────────────────────────
// Replace with your WhatsApp number (international format, no +)
const WHATSAPP_CTA_LINK = `https://wa.me/${import.meta.env.VITE_NUMBER}`;


// ── Contact Section Component ──────────────────────────────
const Contact = () => {
  return (
    <section
      className="contact-section"
      id="contact"
      aria-label="Contact section"
    >
      {/* Ambient background glow — same warm palette as site */}
      <div className="contact-section__bg-glow" aria-hidden="true" />

      <div className="contact-section__inner">

        {/* ── Top label ── */}
        <span className="contact-section__label">
          Let&apos;s Build Something Clean
        </span>

        {/* ── Main heading ── */}
        <h2 className="contact-section__heading">
          Have a Project in Mind?
        </h2>

        {/* ── Subheading ── */}
        <p className="contact-section__subheading">
          Whether you need a brand website, web application, or client
          acquisition system — let&apos;s discuss it.
        </p>

        {/* ── Contact Cards ── */}
        <div className="contact-section__cards" role="list">
          {CONTACT_CARDS.map((card) => (
            <a
              key={card.id}
              className="contact-card"
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={card.ariaLabel}
              role="listitem"
            >
              {/* Icon */}
              <div className="contact-card__icon" aria-hidden="true">
                {card.icon}
              </div>

              {/* Text */}
              <div className="contact-card__text">
                <p className="contact-card__title">{card.title}</p>
                <p className="contact-card__desc">{card.desc}</p>
              </div>
            </a>
          ))}
        </div>

        {/* ── Trust line ── */}
        <div className="contact-section__trust" aria-live="polite">
          <span className="contact-section__trust-dot" aria-hidden="true" />
          Currently available for freelance projects.
        </div>

        {/* ── Process Row ── */}
        <div
          className="contact-section__process"
          role="list"
          aria-label="Project process steps"
        >
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="process-step"
              role="listitem"
            >
              <span className="process-step__number">{step.number}</span>
              <span className="process-step__label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* ── CTA Button ── */}
        <a
          className="contact-section__cta"
          href={WHATSAPP_CTA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a free project discussion on WhatsApp"
        >
          Book a Free Discussion
          <ArrowRightIcon />
        </a>

      </div>
    </section>
  );
};

export default Contact;