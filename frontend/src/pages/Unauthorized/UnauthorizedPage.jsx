import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './UnauthorizedPage.css';

export default function UnauthorizedPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const role = user.role;
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'HORSE_OWNER') navigate('/owner');
    else if (role === 'JOCKEY') navigate('/jockey');
    else if (role === 'RACE_REFEREE') navigate('/referee');
    else navigate('/spectator');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="unauth-container">
      <div className="unauth-glass-card">
        <div className="unauth-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="unauth-warning-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="unauth-title">403</h1>
        <h2 className="unauth-subtitle">Access Denied</h2>
        <p className="unauth-desc">
          Your account role <strong>{user?.role || 'GUEST'}</strong> is not authorized to access this section. 
          Please contact system administration if you believe this is a mistake.
        </p>
        
        <div className="unauth-btn-group">
          <button className="unauth-btn btn-primary" onClick={handleGoHome}>
            Go to My Dashboard
          </button>
          <button className="unauth-btn btn-secondary" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
