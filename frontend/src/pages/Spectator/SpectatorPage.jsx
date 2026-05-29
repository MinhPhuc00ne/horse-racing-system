import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import '../Dashboard.css';

export default function SpectatorPage() {
  const { user, accessToken, refreshToken, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();



  // Upgrade Request States
  const [myRequest, setMyRequest] = useState(null);
  const [requestedRole, setRequestedRole] = useState('HORSE_OWNER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync upgrade requests from the real backend API
  const syncRequests = async () => {
    if (user?.email) {
      try {
        const response = await axiosClient.get('/upgrade-requests/me');
        const myReqs = response.data;
        if (myReqs && myReqs.length > 0) {
          myReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setMyRequest(myReqs[0]);
        } else {
          setMyRequest(null);
        }
      } catch (err) {
        console.error("Failed to fetch upgrade requests:", err);
      }
    }
  };

  useEffect(() => {
    syncRequests();

    const interval = setInterval(syncRequests, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRequestUpgrade = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      await axiosClient.post('/upgrade-requests', {
        requestedRole: requestedRole,
        notes: "Requesting role upgrade to " + requestedRole.replace('_', ' '),
      });
      await syncRequests();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to submit request";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateRole = async () => {
    if (myRequest && myRequest.status === 'APPROVED') {
      try {
        // 1. Call refresh token to get a new access token with the updated role claim
        const refreshResponse = await axiosClient.post('/auth/refresh', {
          refreshToken: refreshToken,
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        
        // Temporarily store new tokens
        localStorage.setItem('horse_racing_accessToken', newAccessToken);
        localStorage.setItem('horse_racing_refreshToken', newRefreshToken);
        
        // 2. Fetch updated user profile
        const profileResponse = await axiosClient.get('/auth/me');
        const updatedUser = profileResponse.data;
        
        // 3. Save new session to AuthContext
        login({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: updatedUser,
        });
        

        
        // 4. Hard redirect to the corresponding dashboard
        if (myRequest.requestedRole === 'HORSE_OWNER') {
          window.location.href = '/owner';
        } else if (myRequest.requestedRole === 'JOCKEY') {
          window.location.href = '/jockey';
        } else if (myRequest.requestedRole === 'RACE_REFEREE') {
          window.location.href = '/referee';
        }
      } catch (err) {
        console.error("Failed to activate new role session:", err);
        alert("Failed to refresh session. Please try logging out and logging back in.");
      }
    }
  };



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
            <span className="role-badge">SPECTATOR ROLE</span>
            <h1 className="dashboard-title">Spectator Feed Panel</h1>
          </div>
          <button className="logout-btn" onClick={logout}>
            Log Out
          </button>
        </header>

        {/* Layout Grid */}
        <div className="dashboard-grid">
          
          {/* Left Column: User details and Upgrade requests */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* User Session Info Card */}
            <div className="glass-card">
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
            </div>

            {/* Upgrade Account Role Card */}
            <div className="glass-card">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                Upgrade Account Role
              </h2>

              {!myRequest && (
                <form onSubmit={handleRequestUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <p className="panel-description" style={{ fontSize: '13.5px', marginBottom: '8px' }}>
                    Request to upgrade your account to one of the active roles below:
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="profile-label">Select Target Role</label>
                    <select 
                      value={requestedRole} 
                      onChange={(e) => setRequestedRole(e.target.value)}
                      style={{
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14.5px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="HORSE_OWNER" style={{ background: '#062315' }}>Horse Owner</option>
                      <option value="JOCKEY" style={{ background: '#062315' }}>Jockey</option>
                      <option value="RACE_REFEREE" style={{ background: '#062315' }}>Race Referee</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      background: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)',
                      color: '#062315',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(252, 211, 77, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}

              {myRequest && myRequest.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    alignSelf: 'center',
                    background: 'rgba(252, 211, 77, 0.1)',
                    color: '#fcd34d',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(252, 211, 77, 0.3)',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    Awaiting Admin Approval
                  </div>
                  <p className="panel-description" style={{ fontSize: '13.5px' }}>
                    You requested an upgrade to <strong>{myRequest.requestedRole.replace('_', ' ')}</strong>.
                  </p>
                  <p style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
                    The system will notify you once an administrator reviews your request.
                  </p>
                </div>
              )}

              {myRequest && myRequest.status === 'APPROVED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    alignSelf: 'center',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                  }}>
                    UPGRADE APPROVED!
                  </div>
                  <p className="panel-description" style={{ fontSize: '13.5px' }}>
                    Your request to upgrade to <strong>{myRequest.requestedRole.replace('_', ' ')}</strong> has been accepted by the Admin.
                  </p>
                  <button 
                    onClick={handleActivateRole}
                    style={{
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Activate New Role
                  </button>
                </div>
              )}

              {myRequest && myRequest.status === 'REJECTED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    alignSelf: 'center',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    textAlign: 'center',
                    width: 'fit-content'
                  }}>
                    Request Rejected
                  </div>
                  <p className="panel-description" style={{ fontSize: '13.5px', textAlign: 'center' }}>
                    Your previous request to upgrade to <strong>{myRequest.requestedRole.replace('_', ' ')}</strong> was rejected.
                  </p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '4px' }}>
                    <form onSubmit={handleRequestUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <p className="panel-description" style={{ fontSize: '13px', marginBottom: '4px' }}>
                        You may select a different role or resubmit below:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select 
                          value={requestedRole} 
                          onChange={(e) => setRequestedRole(e.target.value)}
                          style={{
                            padding: '12px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '14.5px',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="HORSE_OWNER" style={{ background: '#062315' }}>Horse Owner</option>
                          <option value="JOCKEY" style={{ background: '#062315' }}>Jockey</option>
                          <option value="RACE_REFEREE" style={{ background: '#062315' }}>Race Referee</option>
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{
                          background: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)',
                          color: '#062315',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit New Request'}
                      </button>
                    </form>
                  </div>
                </div>
              )}


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
                  Trigger endpoint requests to verify Spring Security role restrictions. Under a <strong>SPECTATOR</strong> role, 
                  you should be allowed to access <code>/public</code>, <code>/spectator</code>, and <code>/any-role</code>, but blocked (403) from others.
                </p>
              </div>

              {/* Endpoint buttons */}
              <div className="test-grid">
                <button className="api-test-button" onClick={() => triggerTestAPI('public')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/public</span>
                  <span className="api-desc">Accessible by anyone (PermitAll)</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('spectator')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/spectator</span>
                  <span className="api-desc">Only accessible by SPECTATOR</span>
                </button>

                <button className="api-test-button" onClick={() => triggerTestAPI('owner')}>
                  <span className="api-route"><span className="api-method">GET</span> /test/owner</span>
                  <span className="api-desc">Only accessible by HORSE_OWNER</span>
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
