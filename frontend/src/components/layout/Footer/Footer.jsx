import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import './Footer.css';

const Footer = () => {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subMessage, setSubMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribedEmail && subscribedEmail.includes('@')) {
      setSubMessage('Thank you for subscribing to race notifications!');
      setSubscribedEmail('');
      setTimeout(() => setSubMessage(''), 4000);
    } else {
      setSubMessage('Please enter a valid email address.');
      setTimeout(() => setSubMessage(''), 3000);
    }
  };

  return (
    <footer className="pro-footer">
      {/* 1. Official Sponsors Banner */}
      <div className="footer-sponsors-bar">
        <Container fluid="lg">
          <Row className="justify-content-center justify-content-md-between align-items-center g-3 text-center">
            <Col xs={6} sm={4} md="auto" className="sponsor-item justify-content-center">
              ROLEX <span className="sponsor-dot"></span>
            </Col>
            <Col xs={6} sm={4} md="auto" className="sponsor-item justify-content-center">
              LONGINES <span className="sponsor-dot"></span>
            </Col>
            <Col xs={6} sm={4} md="auto" className="sponsor-item justify-content-center">
              EMIRATES <span className="sponsor-dot"></span>
            </Col>
            <Col xs={6} sm={4} md="auto" className="sponsor-item justify-content-center">
              ST. JAMES CLUB <span className="sponsor-dot"></span>
            </Col>
            <Col xs={6} sm={4} md="auto" className="sponsor-item justify-content-center">
              DUBAI DUTY FREE <span className="sponsor-dot"></span>
            </Col>
            <Col xs={6} sm={4} md="auto" className="sponsor-item justify-content-center">
              LONGCHAMP
            </Col>
          </Row>
        </Container>
      </div>

      {/* 2. Main Footer Content */}
      <div className="footer-main">
        <Container fluid="lg">
          <Row className="g-4">
            {/* Col 1: System Info & Brand */}
            <Col xs={12} lg={4}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <img src={logo} alt="Horse Racing System Logo" style={{ height: '44px', width: 'auto' }} />
                <div className="footer-brand-title">
                  Horse <span className="footer-brand-gold">Racing</span>
                </div>
              </div>
              <p className="footer-desc">
                The premier Professional Horse Racing Management System. Integrating 10,000 fps optical photo-finish precision, transparent VAR steward oversight, and international thoroughbred pedigree management.
              </p>
              <div className="footer-contact-item">
                <span className="material-symbols-outlined fs-6">location_on</span>
                <span>International Racecourse Complex, Sports District</span>
              </div>
              <div className="footer-contact-item">
                <span className="material-symbols-outlined fs-6">call</span>
                <span>Hotline: +1 (800) 888-9999 (24/7 Support)</span>
              </div>
              <div className="footer-contact-item">
                <span className="material-symbols-outlined fs-6">mail</span>
                <span>Email: contact@horseracingsystem.com</span>
              </div>
            </Col>

            {/* Col 2: Navigation Links */}
            <Col xs={6} sm={6} lg={2}>
              <div className="footer-col-title">System Pages</div>
              <ul className="footer-links">
                <li><Link to="/">Home Canvas</Link></li>
                <li><Link to="/tournaments">Tournaments & Races</Link></li>
                <li><Link to="/live">Live Race Simulation</Link></li>
                <li><Link to="/#rankings">Elite Leaderboards</Link></li>
                <li><Link to="/rules">Rules & Regulations</Link></li>
              </ul>
            </Col>

            {/* Col 3: Role Portals & Fast Access */}
            <Col xs={6} sm={6} lg={2}>
              <div className="footer-col-title">Member Portals</div>
              <ul className="footer-links">
                <li><Link to="/owner">Horse Owner Portal</Link></li>
                <li><Link to="/jockey">Jockey Portal</Link></li>
                <li><Link to="/referee">Referee & Stewards</Link></li>
                <li><Link to="/spectators">Spectator Dashboard</Link></li>
                <li><Link to="/careers">Careers & Hiring</Link></li>
              </ul>
            </Col>

            {/* Col 4: Newsletter Subscription */}
            <Col xs={12} lg={4}>
              <div className="footer-newsletter-box">
                <div className="fw-bold text-white mb-1 d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                  <span className="material-symbols-outlined text-warning" style={{ fontSize: '20px' }}>campaign</span>
                  Subscribe to Race Alerts
                </div>
                <p className="text-white-50 m-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  Get real-time race schedules, cup results, and career opening announcements delivered straight to your inbox.
                </p>
                <form onSubmit={handleSubscribe} className="newsletter-input-group">
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Enter your email address..."
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                  />
                  <button type="submit" className="newsletter-btn">
                    Subscribe
                  </button>
                </form>
                {subMessage && (
                  <div className="mt-2" style={{ fontSize: '0.78rem', color: subMessage.includes('Thank') ? '#22c55e' : '#ef4444' }}>
                    {subMessage}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 3. Bottom Legal Bar */}
      <div className="footer-bottom">
        <Container fluid="lg">
          <Row className="align-items-center justify-content-between g-3">
            <Col xs={12} md="auto">
              © {new Date().getFullYear()} Horse Racing System. All Rights Reserved. International Equine Racing Authority.
            </Col>

            <Col xs={12} md="auto">
              <div className="d-flex flex-wrap gap-3 gap-md-4 justify-content-start justify-content-md-end">
                <Link to="/rules" className="legal-link">Track Rules</Link>
                <Link to="/rules#doping" className="legal-link">Anti-Doping & Vet Policy</Link>
                <Link to="/careers" className="legal-link">Careers</Link>
                <a href="#terms" className="legal-link" onClick={(e) => { e.preventDefault(); alert("Privacy and data security standards follow international IFHA guidelines."); }}>Privacy & Terms</a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;