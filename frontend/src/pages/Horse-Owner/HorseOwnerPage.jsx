import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import '../Dashboard.css';

export default function HorseOwnerPage() {
  const { user, accessToken, logout } = useContext(AuthContext);


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
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <span className="role-badge">HORSE OWNER ROLE</span>
            <h1 className="dashboard-title">Stable & Horse Owner Panel</h1>
          </div>
          <button className="logout-btn" onClick={logout}>
            Log Out
          </button>
        </header>

        {/* Layout Grid */}
        <div className="dashboard-grid">
          
          {/* Left Column: User details */}
          <aside className="glass-card">
            <h2 className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              User Session Info
            </h2>
            
            <div className="user-profile">
              <div className="profile-item">
                <span className="profile-label">Username</span>
                <span className="profile-value">{user?.username || 'N/A'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Full Name</span>
                <span className="profile-value">{user?.fullName || 'N/A'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Email Address</span>
                <span className="profile-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Assigned Role</span>
                <span className="profile-value" style={{ color: '#fcd34d', fontWeight: 'bold' }}>
                  {user?.role || 'N/A'}
                </span>
              </div>

            </div>
          </aside>

          {/* Right Column: API testing */}
          <main className="glass-card">
            <div className="test-panel">
              <div>
                <h2 className="card-title" style={{ borderBottom: 'none', marginBottom: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                  </svg>
                  API Authorization Test Panel
                </h2>
                <p className="panel-description">
                  Trigger endpoint requests to verify Spring Security role restrictions. Under a <strong>HORSE_OWNER</strong> role, 
                  you should be allowed to access <code>/public</code>, <code>/owner</code>, and <code>/any-role</code>, but blocked (403) from others.
                </p>
              </div>

              {/* Endpoint buttons */}
              <div className="test-grid">
                <button className="api-test-button" onClick={() => triggerTestAPI('public')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/public</span>
                  <span className="api-desc">Accessible by anyone (PermitAll)</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('owner')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/owner</span>
                  <span className="api-desc">Only accessible by HORSE_OWNER</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('spectator')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/spectator</span>
                  <span className="api-desc">Only accessible by SPECTATOR</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('jockey')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/jockey</span>
                  <span className="api-desc">Only accessible by JOCKEY</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('referee')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/referee</span>
                  <span className="api-desc">Only accessible by RACE_REFEREE</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('admin')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/admin</span>
                  <span className="api-desc">Only accessible by ADMIN</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('any-role')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/any-role</span>
                  <span className="api-desc">Accessible by any authenticated role</span>
                </button>
              </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
