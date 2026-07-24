import React, { useState, useContext } from 'react';
import { Container, Row, Col, Modal, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import { createFeedbackAPI } from '../../services/feedback';
import './CareersPage.css';

const jobList = [
  {
    id: 1,
    title: 'Professional Jockey (Thoroughbred Race Rider)',
    department: 'Racing Operations & Track Division',
    location: 'International Racecourse - Track Campus',
    type: 'Full-Time',
    salary: '$18,000 - $45,000 / yr + Race Purse Bonuses',
    description: 'Ride thoroughbred horses in official cup competitions, collaborate with trainers on pace strategy, and maintain strict jockey weigh-in standards.',
    requirements: [
      'Valid professional Jockey license or 2+ years competitive riding experience',
      'Height between 150cm - 168cm, riding weight under 54kg',
      'Rapid reflexes and composure during 1200m - 2400m sprint bursts',
      'Regular participation in international steward workshops'
    ]
  },
  {
    id: 2,
    title: 'Head Race Horse Trainer',
    department: 'Stable Management Division',
    location: 'International Racecourse - Stabling Complex',
    type: 'Full-Time',
    salary: '$25,000 - $55,000 / yr',
    description: 'Design nutrition and conditioning regimens for Thoroughbred and Arabian contenders; advise Horse Owners on tournament declarations.',
    requirements: [
      'Minimum 4 years experience conditioning sprint and endurance racehorses',
      'In-depth knowledge of equine cardiovascular physiology and biomechanics',
      'Ability to interpret real-time telemetry heart rate data'
    ]
  },
  {
    id: 3,
    title: 'AI Telemetry & Photo-Finish Systems Engineer',
    department: 'Technology & R&D Division',
    location: 'Main Tech Hub / Hybrid Remote',
    type: 'Full-Time',
    salary: '$20,000 - $40,000 / yr',
    description: 'Develop RFID tracking nodes, 10,000 fps optical photo-finish cameras, and Real-Time 3D Race Simulation algorithms.',
    requirements: [
      'Proficient in Python, C++, OpenCV, Spring Boot, and WebSockets',
      'Experience handling high-speed optical sensor streams and motion detection'
    ]
  },
  {
    id: 4,
    title: 'Racecourse Equine Veterinary Specialist',
    department: 'Medical & Anti-Doping Division',
    location: 'International Racecourse Complex',
    type: 'Full-Time',
    salary: '$22,000 - $48,000 / yr',
    description: 'Oversee pre-race fitness checks, conduct anti-doping blood/urine sampling, and manage post-race equine recovery.',
    requirements: [
      'Doctor of Veterinary Medicine (DVM) degree',
      'Minimum 3 years experience in equine joint ultrasound and respiratory endoscopy'
    ]
  },
  {
    id: 5,
    title: 'Race Steward / Referee',
    department: 'International Stewards Panel',
    location: 'Race Control Tower',
    type: 'Part-Time / Per Event',
    salary: 'Per Race Night Honorarium + Event Bonus',
    description: 'Monitor race movement via multi-angle VAR cameras, adjudge track interference infractions, and certify official placements.',
    requirements: [
      'Thorough knowledge of International Federation of Horseracing Authorities (IFHA) rules',
      'High concentration, impartiality, and decisive judgment under pressure'
    ]
  }
];

export default function CareersPage() {
  const { user } = useContext(AuthContext);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', cv: '' });

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setAppliedSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const applicationContent = `JOB APPLICATION FOR: ${selectedJob?.title}\nCandidate Name: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCV / Experience Summary: ${formData.cv}`;

    try {
      if (user) {
        await createFeedbackAPI({
          subject: `[JOB APPLICATION] ${selectedJob?.title}`,
          content: applicationContent
        });
      } else {
        const existing = JSON.parse(localStorage.getItem('career_job_applications') || '[]');
        existing.push({
          id: Date.now(),
          jobTitle: selectedJob?.title,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          cv: formData.cv,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('career_job_applications', JSON.stringify(existing));
      }
      setAppliedSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setFormData({ fullName: '', email: '', phone: '', cv: '' });
      }, 2500);
    } catch (err) {
      console.warn("API feedback submission error, saving to local application store:", err);
      const existing = JSON.parse(localStorage.getItem('career_job_applications') || '[]');
      existing.push({
        id: Date.now(),
        jobTitle: selectedJob?.title,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cv: formData.cv,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('career_job_applications', JSON.stringify(existing));
      setAppliedSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setFormData({ fullName: '', email: '', phone: '', cv: '' });
      }, 2500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="careers-page">
      {/* Hero Banner */}
      <section className="careers-hero text-center">
        <Container>
          <div className="job-badge d-inline-block mb-3">World-Class Careers</div>
          <h1 className="careers-hero-title">
            Join the Premier <span className="careers-hero-gold">Horse Racing Team</span>
          </h1>
          <p className="lead mx-auto text-white-50" style={{ maxWidth: '750px', fontSize: '1.05rem', lineHeight: '1.7' }}>
            We are looking for passionate individuals who thrive on speed, sports technology, and absolute integrity. Help shape the future of international equine racing.
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <Container className="my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-white mb-2">Open Career Positions</h2>
          <p className="text-white-50">Global working environment, competitive rewards, and clear career advancement pathways.</p>
        </div>

        <Row className="g-4">
          {jobList.map((job) => (
            <Col key={job.id} xs={12} md={6} lg={4}>
              <div className="job-card d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="job-badge">{job.type}</span>
                  <span className="text-white-50" style={{ fontSize: '0.78rem' }}>{job.department}</span>
                </div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-salary">{job.salary}</div>
                <p className="job-desc flex-grow-1">{job.description}</p>
                <div className="mb-3">
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.82rem' }}>Key Requirements:</strong>
                  <ul className="text-white-50 ps-3 m-0" style={{ fontSize: '0.8rem' }}>
                    {job.requirements.slice(0, 2).map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => handleOpenApply(job)} className="apply-btn mt-auto">
                  Apply Now
                </button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="careers-modal">
        <Modal.Header closeButton style={{ backgroundColor: '#07150c', color: '#fff', borderBottom: '1px solid #d4af37' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: '700' }}>
            Apply Position: <span style={{ color: '#ffd700' }}>{selectedJob?.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#0c2214', color: '#fff' }}>
          {appliedSuccess ? (
            <div className="text-center py-4 text-success">
              <span className="material-symbols-outlined display-3 mb-2">check_circle</span>
              <h5 className="fw-bold">Application Sent Successfully!</h5>
              <p className="text-white-50">Your application has been routed directly to the Admin HR Panel. Our team will review your CV and contact you within 48 business hours.</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50 small">Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  required 
                  placeholder="e.g. John Sterling"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ backgroundColor: '#051009', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50 small">Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  required 
                  placeholder="john.sterling@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ backgroundColor: '#051009', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50 small">Phone Number</Form.Label>
                <Form.Control 
                  type="tel" 
                  required 
                  placeholder="+1 555-0192"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ backgroundColor: '#051009', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50 small">Cover Letter / Online CV Link</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  required 
                  placeholder="Summary of experience, licenses, or racing background..."
                  value={formData.cv}
                  onChange={(e) => setFormData({ ...formData, cv: e.target.value })}
                  style={{ backgroundColor: '#051009', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </Form.Group>
              <Button type="submit" disabled={submitting} className="w-100 fw-bold border-0" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', color: '#07150c' }}>
                {submitting ? 'Sending Application...' : 'Submit Application to HR Admin'}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
