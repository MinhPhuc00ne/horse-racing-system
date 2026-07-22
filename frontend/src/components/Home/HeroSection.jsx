import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../../assets/background.jpg';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="live" className="hero-section" aria-label="Equine competition hero">
      <img src={heroBg} alt="Equestrian Racing" className="hero-bg-img" />
      <div className="hero-gradient-overlay" />
      <div className="hero-racing-lines" />

      <div className="hero-container-inner">
        <div className="hero-text-content">
          <p className="hero-eyebrow">National Racetrack and Tournament Dashboard System</p>
          <h1 className="hero-title">
            Experience <span>Elite</span> Professional Horse Racing
          </h1>
          <p className="hero-description">
            Manage, track, and participate in the world's most exclusive horse racing tournaments in real-time. Where heritage meets state-of-the-art technology.
          </p>
          <div className="hero-btn-group">
            <button className="btn-primary-luxury" type="button" onClick={() => navigate('/live')}>
              <span className="pulse-dot" style={{ display: 'inline-block', marginRight: '8px', width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '50%' }} /> 
              Watch Live Racing
            </button>
            <button className="btn-secondary-luxury" type="button" onClick={() => navigate('/tournaments')}>Join Tournaments</button>
          </div>
        </div>

        <div className="track-preview-card" aria-label="Track preview countdown">
          <div className="track-card-header">
            <span className="track-label">Next Racetrack: Royal Ascot</span>
            <span className="live-status"><span className="pulse-dot" /> 3D Simulation</span>
          </div>
          <div className="svg-track-container">
            <span className="track-ring ring-one" />
            <span className="track-ring ring-two" />
            <span className="track-ring ring-three" />
            <div className="countdown-box">
              <div className="countdown-time">02:03:08</div>
              <div className="countdown-sub">Next Tournament Starts In</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
