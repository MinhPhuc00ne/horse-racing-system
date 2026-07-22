import React from 'react';

export default function UpgradeRequestsPanel({ pendingRequests, onApprove, onReject, setLightboxImage }) {
  return (
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
                    {req.requestedRole?.replace('_', ' ')}
                  </span>
                </div>

                {/* Detailed Applicant Profile Grid */}
                <div className="details-grid">
                  <span className="details-label">Phone Number:</span>
                  <span className="details-value">{req.phoneNumber || 'N/A'}</span>

                  <span className="details-label">Date of Birth:</span>
                  <span className="details-value">{req.dateOfBirth || 'N/A'}</span>

                  <span className="details-label">ID/Passport Number:</span>
                  <span className="details-value">{req.identityNumber || 'N/A'}</span>

                  {req.requestedRole === 'JOCKEY' && (
                    <>
                      <span className="details-label">Weight:</span>
                      <span className="details-value">{req.weight ? `${req.weight} kg` : 'N/A'}</span>

                      <span className="details-label">Height:</span>
                      <span className="details-value">{req.height ? `${req.height} cm` : 'N/A'}</span>

                      <span className="details-label">License Number:</span>
                      <span className="details-value">{req.licenseNumber || 'N/A'}</span>
                    </>
                  )}

                  {req.requestedRole === 'HORSE_OWNER' && (
                    <>
                      <span className="details-label">Stable Name:</span>
                      <span className="details-value">{req.stableName || 'N/A'}</span>

                      <span className="details-label">Stable Address:</span>
                      <span className="details-value">{req.stableAddress || 'N/A'}</span>
                    </>
                  )}

                  {req.requestedRole === 'RACE_REFEREE' && (
                    <>
                      <span className="details-label">Certificate Number:</span>
                      <span className="details-value">{req.certificationNumber || 'N/A'}</span>

                      <span className="details-label">Years of Experience:</span>
                      <span className="details-value">{req.experienceYears !== null ? `${req.experienceYears} years` : 'N/A'}</span>
                    </>
                  )}

                  {req.notes && (
                    <>
                      <span className="details-label" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>Notes:</span>
                      <span className="details-value" style={{ gridColumn: 'span 2', textAlign: 'left', color: '#a0aec0', fontStyle: 'italic', fontSize: '13px' }}>
                        "{req.notes}"
                      </span>
                    </>
                  )}
                </div>

                {/* Certificates & Verification Documents Gallery */}
                {req.documentUrls && req.documentUrls.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <span className="profile-label" style={{ display: 'block', marginBottom: '6px', fontSize: '11px' }}>Credentials & Verification Documents:</span>
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
                  onClick={() => onApprove(req.id)}
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
                  onClick={() => onReject(req.id)}
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
    </div>
  );
}
