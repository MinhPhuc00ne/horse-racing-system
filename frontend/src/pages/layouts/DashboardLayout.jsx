import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import Footer from '../../components/Footer/Footer';
import './DashboardLayout.css';

export default function DashboardLayout({ navLinks, profile, children }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="dashboard-layout-container d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: 'var(--ho-bg-cream, #f6f3f2)' }}>
      {/* Reusable top header */}
      <DashboardHeader 
        user={user} 
        profile={profile} 
        navLinks={navLinks} 
        logout={logout} 
      />

      {/* Main content body */}
      <main className="flex-grow-1 w-100 p-4 p-md-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
