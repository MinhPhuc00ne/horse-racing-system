import React, { useState } from 'react';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import './NewsPage.css';
import heroImg from '../../assets/hero_horse_racing.png';

const articlesList = [
  {
    id: 1,
    title: 'New Speed Record Established at Summer Cup 2026: 1m 21s for 1400m Distance',
    category: 'Tournament Feature',
    date: '24/07/2026',
    image: heroImg,
    excerpt: 'Thoroughbred Stellar Majesty ridden by Jockey Clarissa Sterling achieved a historic milestone, reaching a peak speed of 68.5 km/h on the final turf bend.',
    content: `
      During the Summer Cup 2026 at the International Racecourse, Golden Crown Stable's thoroughbred contender Stellar Majesty set a track record for the 1400m distance, stopping the clock at 1 minute 21.345 seconds.
      
      Ridden by master Jockey Clarissa Sterling, Stellar Majesty stalked the leaders in 3rd place before unleashing an explosive stretch run down the final 400m home straight. The 10,000 fps photo-finish camera recorded the horse's nose crossing 1.2 lengths ahead of the closest pursuer.
      
      Head Trainer commented after the victory: "Pace control and breathing rhythm through the second turn allowed our contender to reserve 100% burst energy for the final stretch."
    `
  },
  {
    id: 2,
    title: 'Optical Timing & RFID Telemetry System Receives Tier-1 IFHA Certification',
    category: 'Tech & Infrastructure',
    date: '20/07/2026',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    excerpt: 'International Audit Panel officially grants Tier-1 certification to the Horse Racing System photo-finish optical sensors and telemetry chip stack.',
    content: `
      The Horse Racing System has passed 50 rigorous benchmarks evaluating millisecond timing precision and real-time telemetry streaming.
      
      State-of-the-art infrastructure includes:
      - 16 vertical line-scan optical cameras capturing 10,000 frames/sec at the finish post.
      - Micro-RFID saddle sensors broadcasting GPS position and heart rate at 50Hz.
      - 3D Real-time Race Simulation engine rendering the track online for remote spectators.
    `
  },
  {
    id: 3,
    title: 'Horse Owner Ecosystem & Royal Thoroughbred Pedigree Breeding Standards',
    category: 'Heritage & Breeding',
    date: '15/07/2026',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Discover the 5-generation pedigree verification process for purebred racehorses and support grants from the National Equine Racing Fund.',
    content: `
      Horse racing is both a high-speed sport and the preservation of purebred thoroughbred heritage.
      
      Every racehorse registered in the system is issued a digital DNA passport tracing 5 generations of lineage. Horse Owners joining the network receive comprehensive veterinary care packages, imported grain nutrition, and access to premium training gallops.
    `
  },
  {
    id: 4,
    title: 'Next-Gen Jockey Academy Selection: The Journey to International Glory',
    category: 'Careers & Training',
    date: '10/07/2026',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    excerpt: 'The Jockey Academy announces Autumn admissions featuring masterclasses led by former Dubai World Cup champion riders.',
    content: `
      Becoming a professional jockey requires a blend of steel determination, physical agility, and deep synergy with the racehorse.
      
      The 12-month curriculum covers intense cardio conditioning, balance control in the stirrups, and tactical race line positioning. Graduates earn professional riding licenses and contract opportunities with top-tier stables.
    `
  }
];

export default function NewsPage() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="news-page">
      {/* Hero */}
      <section className="news-hero text-center">
        <Container>
          <div className="d-inline-block px-3 py-1 mb-2 rounded-pill bg-warning text-dark fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            NEWS & HERITAGE DISPATCH
          </div>
          <h1 className="fw-extrabold text-white display-5">
            Equine Heritage & <span style={{ color: '#ffd700' }}>System News</span>
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '750px', fontSize: '1.05rem' }}>
            Explore tournament announcements, track speed record breakthroughs, and stories from championship winning stables.
          </p>
        </Container>
      </section>

      {/* Grid */}
      <Container className="my-5">
        <Row className="g-4">
          {articlesList.map((article) => (
            <Col key={article.id} xs={12} md={6}>
              <div className="news-card cursor-pointer d-flex flex-column" onClick={() => setSelectedArticle(article)}>
                <img src={article.image} alt={article.title} className="news-img" />
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="news-badge">{article.category}</span>
                    <span className="text-white-50" style={{ fontSize: '0.78rem' }}>{article.date}</span>
                  </div>
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-excerpt flex-grow-1">{article.excerpt}</p>
                  <div className="mt-3 text-warning fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
                    <span>Read Full Article</span>
                    <span className="material-symbols-outlined fs-6">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Article Detail Modal */}
      <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" centered className="news-modal">
        {selectedArticle && (
          <>
            <Modal.Header closeButton style={{ backgroundColor: '#07150c', color: '#fff', borderBottom: '1px solid #d4af37' }}>
              <div>
                <span className="news-badge me-2">{selectedArticle.category}</span>
                <span className="text-white-50 small">{selectedArticle.date}</span>
              </div>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#0c2214', color: '#fff', padding: '28px' }}>
              <h2 className="fw-bold text-warning mb-3" style={{ fontSize: '1.4rem' }}>{selectedArticle.title}</h2>
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-100 rounded mb-4" style={{ maxHeight: '360px', objectFit: 'cover' }} />
              <div className="text-light" style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '0.98rem' }}>
                {selectedArticle.content}
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
}
