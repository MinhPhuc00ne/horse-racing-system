import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useAdminRequests } from '../../hooks/useAdminRequests';
import AdminProfileCard from './components/AdminProfileCard';
import UpgradeRequestsPanel from './components/UpgradeRequestsPanel';
import UpgradeHistory from './components/UpgradeHistory';
import '../Dashboard.css';

export default function AdminPage() {
  const { user, logout } = useContext(AuthContext);
  const { 
    pendingRequests, 
    resolvedRequests, 
    approveRequest, 
    rejectRequest 
  } = useAdminRequests();

  const [lightboxImage, setLightboxImage] = useState(null);

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
          <AdminProfileCard user={user} />

          {/* Right Column: Upgrade requests and history */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <UpgradeRequestsPanel 
              pendingRequests={pendingRequests}
              onApprove={approveRequest}
              onReject={rejectRequest}
              setLightboxImage={setLightboxImage}
            />

            <UpgradeHistory resolvedRequests={resolvedRequests} />

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
