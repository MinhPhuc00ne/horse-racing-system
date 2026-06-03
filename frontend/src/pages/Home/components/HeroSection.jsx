import React from 'react';
import heroBg from '../../../assets/background.jpg';

export default function HeroSection() {
  return (
    <section className="hero-section" aria-label="Equine competition hero">
      <img src={heroBg} alt="Equestrian Racing" className="hero-bg-img" />
      <div className="hero-gradient-overlay" />
      <div className="hero-racing-lines" />

      <div className="hero-container-inner">
        <div className="hero-text-content">
          <p className="hero-eyebrow">National track and league live dashboard</p>
          <h1 className="hero-title">
            Experience the <span>Apex</span> of Equine Competition
          </h1>
          <p className="hero-description">
            Manage, track, and engage with the world's most exclusive horse racing tournaments in real-time. Where heritage meets high-performance technology.
          </p>
          <div className="hero-btn-group">
            <button className="btn-primary-luxury" type="button">Watch Live Races</button>
            <button className="btn-secondary-luxury" type="button">Join Tournament</button>
          </div>
        </div>

        <div className="track-preview-card" aria-label="Track preview countdown">
          <div className="track-card-header">
            <span className="track-label">Track Preview: Royal Ascot</span>
            <span className="live-status"><span className="pulse-dot" /> Live Rendering</span>
          </div>
          <div className="svg-track-container">
            <span className="track-ring ring-one" />
            <span className="track-ring ring-two" />
            <span className="track-ring ring-three" />
            <div className="countdown-box">
              <div className="countdown-time">02:03:08</div>
              <div className="countdown-sub">Next Match Starts In</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
