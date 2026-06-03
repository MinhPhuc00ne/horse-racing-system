import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import DashboardLayout from '../layouts/DashboardLayout';
import '../Dashboard.css';

const jockeyNavLinks = [
  { path: '/jockey/dashboard', label: 'Dashboard', icon: 'dashboard' }
];

function JockeyDashboardContent() {
  const { user } = useContext(AuthContext);

  const triggerTestAPI = async (endpoint) => {
    try {
      const response = await axiosClient.get(`/test/${endpoint}`);
      alert(`API Success (200): ${JSON.stringify(response.data)}`);
    } catch (error) {
      const status = error.response?.status || 'Network Error';
      alert(`API Error (${status}): ${error.message}`);
    }
  };

  return (
    <div className="dashboard-wrapper p-0">
      {/* Page Title inside content body */}
      <div className="mb-4">
        <span className="role-badge">JOCKEY ROLE</span>
        <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Jockey Dashboard</h2>
        <p className="text-secondary small">Access jockey information and perform Security Role checks.</p>
      </div>

      {/* Layout Grid */}
      <div className="dashboard-grid">
        {/* Left Column: User details */}
        <aside className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <h2 className="card-title text-dark" style={{ borderColor: 'var(--ho-border-muted)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--ho-primary-medium)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            User Session Info
          </h2>
          
          <div className="user-profile">
            <div className="profile-item">
              <span className="profile-label">Username</span>
              <span className="profile-value text-dark" style={{ backgroundColor: '#f0eded' }}>{user?.username || 'N/A'}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Full Name</span>
              <span className="profile-value text-dark" style={{ backgroundColor: '#f0eded' }}>{user?.fullName || 'N/A'}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email Address</span>
              <span className="profile-value text-dark" style={{ backgroundColor: '#f0eded' }}>{user?.email || 'N/A'}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Assigned Role</span>
              <span className="profile-value text-dark fw-bold" style={{ backgroundColor: '#f0eded', color: 'var(--ho-primary-medium) !important' }}>
                {user?.role || 'N/A'}
              </span>
            </div>
          </div>
        </aside>

        {/* Right Column: API testing */}
        <main className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="test-panel">
            <div>
              <h2 className="card-title text-dark" style={{ borderBottom: 'none', marginBottom: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--ho-primary-medium)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                </svg>
                API Authorization Test Panel
              </h2>
              <p className="panel-description text-secondary">
                Trigger endpoint requests to verify Spring Security role restrictions. Under a <strong>JOCKEY</strong> role, 
                you should be allowed to access <code>/public</code>, <code>/jockey</code>, and <code>/any-role</code>, but blocked (403) from others.
              </p>
            </div>

            {/* Endpoint buttons */}
            <div className="test-grid">
              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('public')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/public</span>
                <span className="api-desc text-secondary">Accessible by anyone (PermitAll)</span>
              </button>

              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('jockey')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/jockey</span>
                <span className="api-desc text-secondary">Only accessible by JOCKEY</span>
              </button>

              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('spectator')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/spectator</span>
                <span className="api-desc text-secondary">Only accessible by SPECTATOR</span>
              </button>

              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('owner')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/owner</span>
                <span className="api-desc text-secondary">Only accessible by HORSE_OWNER</span>
              </button>

              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('referee')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/referee</span>
                <span className="api-desc text-secondary">Only accessible by RACE_REFEREE</span>
              </button>

              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('admin')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/admin</span>
                <span className="api-desc text-secondary">Only accessible by ADMIN</span>
              </button>

              <button className="api-test-button border text-dark" style={{ backgroundColor: '#f0eded' }} onClick={() => triggerTestAPI('any-role')}>
                <span className="api-route text-dark"><span className="api-method">GET</span> /test/any-role</span>
                <span className="api-desc text-secondary">Accessible by any authenticated role</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function JockeyPage() {
  return (
    <DashboardLayout navLinks={jockeyNavLinks}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<JockeyDashboardContent />} />
      </Routes>
    </DashboardLayout>
  );
}
