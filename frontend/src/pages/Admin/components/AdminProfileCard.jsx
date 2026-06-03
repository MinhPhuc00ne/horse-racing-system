import React from 'react';

export default function AdminProfileCard({ user }) {
  return (
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
  );
}
