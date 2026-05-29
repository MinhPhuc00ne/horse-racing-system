import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import '../Dashboard.css';

export default function AdminPage() {
  const { user, accessToken, logout } = useContext(AuthContext);


  // Upgrade Requests State
  const [requests, setRequests] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  const syncRequests = async () => {
    try {
      const response = await axiosClient.get('/admin/upgrade-requests');
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch upgrade requests:", err);
    }
  };

  useEffect(() => {
    syncRequests();
    
    const interval = setInterval(syncRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveRequest = async (requestId, status) => {
    try {
      if (status === 'APPROVED') {
        const confirmApprove = window.confirm("Bạn có chắc chắn muốn DUYỆT yêu cầu nâng cấp này?");
        if (!confirmApprove) return;
        await axiosClient.put(`/admin/upgrade-requests/${requestId}/approve`);
      } else {
        const reason = prompt("Nhập lý do từ chối yêu cầu:");
        if (reason === null) return; // User clicked Cancel
        await axiosClient.put(`/admin/upgrade-requests/${requestId}/reject`, {
          rejectionReason: reason || "Yêu cầu bị từ chối bởi Quản trị viên",
        });
      }
      syncRequests();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to resolve request";
      alert(errMsg);
    }
  };



  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const resolvedRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <span className="role-badge">ADMIN ROLE</span>
            <h1 className="dashboard-title">Admin Control Panel</h1>
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

          {/* Right Column: Upgrade requests and API testing */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* User Role Upgrade Requests Panel */}
            <div className="glass-card">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-9-3.5h.008v.008H12V4.5zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008z" />
                </svg>
                User Role Upgrade Requests
              </h2>
              
              {pendingRequests.length === 0 ? (
                <p className="panel-description" style={{ fontStyle: 'italic', color: '#718096', margin: 0 }}>
                  No pending role upgrade requests at the moment.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {pendingRequests.map((req) => (
                    <div 
                      key={req.id} 
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        justifyContent: 'space-between',
                        alignItems: 'stretch'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '16px', color: '#ffffff' }}>
                            {req.fullName || req.userFullName}
                          </span>
                          <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                            {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                          Email: <strong style={{ color: '#ffffff' }}>{req.userEmail}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{
                            padding: '3px 8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#a0aec0'
                          }}>
                            SPECTATOR
                          </span>
                          <span style={{ color: '#fcd34d' }}>&rarr;</span>
                          <span style={{
                            padding: '3px 8px',
                            background: 'rgba(252, 211, 77, 0.1)',
                            border: '1px solid rgba(252, 211, 77, 0.3)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#fcd34d'
                          }}>
                            {req.requestedRole.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Detailed Applicant Profile Grid */}
                        <div className="details-grid">
                          <span className="details-label">Số điện thoại:</span>
                          <span className="details-value">{req.phoneNumber || 'N/A'}</span>

                          <span className="details-label">Ngày sinh:</span>
                          <span className="details-value">{req.dateOfBirth || 'N/A'}</span>

                          <span className="details-label">Số CCCD/Hộ chiếu:</span>
                          <span className="details-value">{req.identityNumber || 'N/A'}</span>

                          {req.requestedRole === 'JOCKEY' && (
                            <>
                              <span className="details-label">Cân nặng:</span>
                              <span className="details-value">{req.weight ? `${req.weight} kg` : 'N/A'}</span>

                              <span className="details-label">Chiều cao:</span>
                              <span className="details-value">{req.height ? `${req.height} cm` : 'N/A'}</span>

                              <span className="details-label">Số giấy phép:</span>
                              <span className="details-value">{req.licenseNumber || 'N/A'}</span>
                            </>
                          )}

                          {req.requestedRole === 'HORSE_OWNER' && (
                            <>
                              <span className="details-label">Tên trang trại:</span>
                              <span className="details-value">{req.stableName || 'N/A'}</span>

                              <span className="details-label">Địa chỉ trang trại:</span>
                              <span className="details-value">{req.stableAddress || 'N/A'}</span>
                            </>
                          )}

                          {req.requestedRole === 'RACE_REFEREE' && (
                            <>
                              <span className="details-label">Số chứng chỉ:</span>
                              <span className="details-value">{req.certificationNumber || 'N/A'}</span>

                              <span className="details-label">Số năm kinh nghiệm:</span>
                              <span className="details-value">{req.experienceYears !== null ? `${req.experienceYears} năm` : 'N/A'}</span>
                            </>
                          )}

                          {req.notes && (
                            <>
                              <span className="details-label" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>Ghi chú:</span>
                              <span className="details-value" style={{ gridColumn: 'span 2', textAlign: 'left', color: '#a0aec0', fontStyle: 'italic', fontSize: '13px' }}>
                                "{req.notes}"
                              </span>
                            </>
                          )}
                        </div>

                        {/* Certificates & Verification Documents Gallery */}
                        {req.documentUrls && req.documentUrls.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <span className="profile-label" style={{ display: 'block', marginBottom: '6px', fontSize: '11px' }}>Bằng Cấp & Tài Liệu Xác Minh:</span>
                            <div className="doc-gallery">
                              {req.documentUrls.map((url, idx) => (
                                <img 
                                  key={idx} 
                                  src={`http://localhost:8080${url}`} 
                                  alt={`certificate-${idx}`} 
                                  className="doc-thumbnail"
                                  onClick={() => setLightboxImage(url)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <button
                          onClick={() => handleResolveRequest(req.id, 'APPROVED')}
                          style={{
                            flex: 1,
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#10b981';
                            e.target.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                            e.target.style.color = '#10b981';
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleResolveRequest(req.id, 'REJECTED')}
                          style={{
                            flex: 1,
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#ef4444';
                            e.target.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.target.style.color = '#ef4444';
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* History / Resolved Requests Log */}
              {resolvedRequests.length > 0 && (
                <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '15px' }}>
                    Resolution History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                    {resolvedRequests.map((req) => (
                      <div 
                        key={req.id}
                        style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: '#ffffff' }}>
                            {req.userFullName}
                          </span>
                          <span style={{ fontSize: '12px', color: '#718096' }}>
                            Requested: {req.requestedRole.replace('_', ' ')}
                          </span>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: req.status === 'APPROVED' ? '#10b981' : '#ef4444',
                          border: req.status === 'APPROVED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>



          </main>

        </div>
      </div>
      {lightboxImage && (
        <div className="lightbox-modal" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={`http://localhost:8080${lightboxImage}`} alt="Full Certificate" className="lightbox-img" />
            <button className="lightbox-close" onClick={() => setLightboxImage(null)} style={{ top: '-40px' }}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}

