import React from 'react';

export default function UpgradeHistory({ resolvedRequests }) {
  if (resolvedRequests.length === 0) return null;

  return (
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
                Requested: {req.requestedRole?.replace('_', ' ')}
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
  );
}
