import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './RulesPage.css';

const ruleCategories = [
  { id: 'gate', title: 'Starting Gate & Break Rules', icon: 'door_sliding' },
  { id: 'weight', title: 'Jockey Weight & Gear Standards', icon: 'scale' },
  { id: 'interference', title: 'Track Interference & VAR Inquiries', icon: 'gavel' },
  { id: 'doping', title: 'Veterinary Check & Anti-Doping', icon: 'vaccines' },
  { id: 'timing', title: '10,000fps Photo-Finish & Timing', icon: 'timer' },
];

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState('gate');

  return (
    <div className="rules-page">
      {/* Hero Header */}
      <section className="rules-hero text-center">
        <Container>
          <div className="d-inline-block px-3 py-1 mb-2 rounded-pill bg-warning text-dark fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            OFFICIAL RACING RULEBOOK
          </div>
          <h1 className="fw-extrabold text-white display-5">
            International Racing <span style={{ color: '#ffd700' }}>Rules & Regulations</span>
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '700px', fontSize: '1rem' }}>
            Enforced in accordance with the International Federation of Horseracing Authorities (IFHA), ensuring transparency, jockey safety, and absolute competitive fairness.
          </p>
        </Container>
      </section>

      {/* Rules Body */}
      <Container className="my-5">
        <Row className="g-4">
          {/* Navigation Sidebar */}
          <Col xs={12} md={4} lg={3}>
            <div className="d-flex flex-column gap-2">
              {ruleCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`rules-nav-pill ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  <span className="material-symbols-outlined fs-5">{cat.icon}</span>
                  <span>{cat.title}</span>
                </div>
              ))}
            </div>
          </Col>

          {/* Content Pane */}
          <Col xs={12} md={8} lg={9}>
            <div className="rule-content-card">
              {activeTab === 'gate' && (
                <div>
                  <h2 className="rule-section-title">1. Starting Gate Procedure & Break Rules</h2>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">1.1. Gate Stall Entry Order</h3>
                    <p className="rule-item-p">
                      Horses must be loaded into designated stalls corresponding to post position draws. Horses with a history of stall nervousness will be loaded last under the direct instruction of the Starter.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">1.2. False Start Protocols</h3>
                    <p className="rule-item-p">
                      If gates fail to open simultaneously due to mechanical failure or a horse forces open the stall prior to the signal, the Starter will trigger the false start beacon. The race will be aborted and re-loaded within 10 minutes.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">1.3. Safety Gate Equipment</h3>
                    <p className="rule-item-p">
                      All starting gates feature padded rubber linings to prevent injury and electromagnetic doors engineered for millisecond precision release.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'weight' && (
                <div>
                  <h2 className="rule-section-title">2. Jockey Weight & Equipment Standards</h2>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">2.1. Pre & Post-Race Weigh-In Protocols</h3>
                    <p className="rule-item-p">
                      Every jockey, complete with saddle, protective vest, and whip, must pass through the official scales 45 minutes prior to post time. Post-race weight variation must not exceed 0.5kg allowance.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">2.2. Mandatory Safety Gear</h3>
                    <p className="rule-item-p">
                      Jockeys must wear ASTM F1163 compliant safety helmets, level 3 protective body vests, turf goggles, and specialized riding boots. Whips must feature padded foam ends meeting animal welfare standards.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">2.3. Whip Usage Limits</h3>
                    <p className="rule-item-p">
                      Jockeys are restricted to a maximum of 6 whip strikes per race, with no strikes permitted above shoulder height. Infractions result in purse forfeiture and 3-6 race suspensions.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'interference' && (
                <div>
                  <h2 className="rule-section-title">3. Track Interference & VAR Inquiries</h2>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">3.1. Home Straight Riding Line Rule</h3>
                    <p className="rule-item-p">
                      Upon entering the final 400m home straight, jockeys must maintain their lane. Crossing over to impede rivals is strictly prohibited unless clear by at least two full horse lengths.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">3.2. Stewards Inquiry & VAR Review</h3>
                    <p className="rule-item-p">
                      In the event of an interference objection, the yellow Inquiry flag is displayed. Stewards review 4K footage from 8 VAR angles. Offending horses causing interference will be demoted behind the impeded horse.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'doping' && (
                <div>
                  <h2 className="rule-section-title">4. Veterinary Checks & Anti-Doping Policy</h2>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">4.1. Pre-Race Fitness Inspection</h3>
                    <p className="rule-item-p">
                      24 hours prior to post time, official equine veterinarians inspect heart rates, respiratory health, and tendon gait of all entries. Any horse displaying lameness is immediately scratched.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">4.2. Sample Collection & Testing</h3>
                    <p className="rule-item-p">
                      The top 3 finishers plus one random contender are escorted to the test barn for blood and urine sampling. Sealed samples are dispatched to WADA/IFHA accredited laboratories.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'timing' && (
                <div>
                  <h2 className="rule-section-title">5. Photo-Finish & Timing Regulations</h2>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">5.1. Nose On Line Finish Standard</h3>
                    <p className="rule-item-p">
                      Placements at the finish post are determined exclusively by the moment the **horse's nose** crosses the optical finish line, not the jockey or hooves.
                    </p>
                  </div>
                  <div className="rule-item">
                    <h3 className="rule-item-h4">5.2. 10,000 fps Photo-Finish Cameras</h3>
                    <p className="rule-item-p">
                      Line-scan cameras capture 10,000 frames/sec. In the rare event of a Dead Heat (identical margin), stewards declare a tie and purse money is divided equally.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
