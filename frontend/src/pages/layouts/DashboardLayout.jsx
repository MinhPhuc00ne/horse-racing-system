import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import Footer from '../../components/Footer/Footer';
import './DashboardLayout.css';
import logo from '../../assets/logo.png';

export default function DashboardLayout({ navLinks, profile, children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isHomePage = location.pathname.endsWith('/home') || location.pathname === '/';

  if (isAdmin) {
    return (
      <div className="admin-layout-container d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: 'var(--ho-bg-cream, #f6f3f2)' }}>
        {/* Admin Header (Mobile only, hidden on Desktop via d-xl-none) */}
        <div className="d-xl-none">
          <AdminHeader 
            user={user} 
            profile={profile} 
            navLinks={navLinks} 
            logout={logout} 
          />
        </div>

        <div className="d-flex flex-grow-1 w-100 position-relative">
          {/* Left Sidebar for Admin (Desktop only) */}
          <aside 
            className="admin-sidebar d-none d-xl-flex flex-column py-4 flex-shrink-0" 
            style={{ 
              width: isSidebarCollapsed ? '80px' : '260px', 
              height: '100vh', 
              position: 'sticky', 
              top: 0,
              transition: 'width 0.3s ease'
            }}
          >
            {/* Logo / Branding in Sidebar */}
            <div className={`px-3 mb-3 pb-3 border-bottom admin-sidebar-brand-wrapper d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
              {!isSidebarCollapsed && (
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/')}
                >
                  <img src={logo} alt="EquineElite Logo" style={{ height: '50px', width: 'auto' }} />
                </div>
              )}
              {isSidebarCollapsed && (
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/')}
                  title="EquineElite Pro"
                >
                  <img src={logo} alt="EE Logo" style={{ height: '35px', width: 'auto' }} />
                </div>
              )}
              
              {/* Collapse/Expand Toggle Button */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="btn btn-sm text-white p-1 border-0 d-flex align-items-center justify-content-center"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  borderRadius: '6px', 
                  width: '28px', 
                  height: '28px',
                  marginLeft: isSidebarCollapsed ? '0' : '8px'
                }}
                title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              >
                <span className="material-symbols-outlined fs-5" style={{ margin: 0 }}>
                  {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="px-3 d-flex flex-column gap-1 flex-grow-1 overflow-y-auto no-scrollbar">
              {navLinks && navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => 
                    `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link-inactive'} ${isSidebarCollapsed ? 'justify-content-center' : ''}`
                  }
                  title={isSidebarCollapsed ? link.label : undefined}
                  style={{ padding: isSidebarCollapsed ? '12px 0' : '12px 18px' }}
                >
                  {link.icon && <span className="material-symbols-outlined fs-5">{link.icon}</span>}
                  {!isSidebarCollapsed && <span>{link.label}</span>}
                </NavLink>
              ))}
            </div>

            {/* Profile info in Sidebar (since Header is removed on Desktop) */}
            <div 
              className={`px-3 mb-2 mt-auto border-top pt-3 d-flex align-items-center gap-3 ${isSidebarCollapsed ? 'justify-content-center' : ''}`} 
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <div 
                className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center flex-shrink-0" 
                style={{ width: '36px', height: '36px', borderColor: 'var(--ho-accent-gold, #D4AF37)', cursor: 'pointer' }}
                onClick={() => navigate('/admin/dashboard')}
                title={isSidebarCollapsed ? (profile?.fullName || user?.fullName || 'System Admin') : undefined}
              >
                <img
                  alt="User Profile Avatar"
                  className="w-100 h-100 object-fit-cover"
                  src={profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="d-flex flex-column overflow-hidden text-start">
                  <span className="fs-7 fw-bold lh-sm text-white text-truncate" style={{ fontSize: '13px' }}>
                    {profile?.fullName || user?.fullName || 'System Admin'}
                  </span>
                  <span className="ho-font-grotesk fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'var(--ho-primary-light, #95d4ac)' }}>
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              )}
            </div>

            {/* Logout button at the bottom */}
            <div className="px-3 pt-2 admin-sidebar-footer">
              <button 
                className={`btn btn-outline-danger btn-sm text-start d-flex align-items-center gap-2 p-2 w-100 rounded-3 admin-sidebar-logout-btn ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
                onClick={logout}
                title={isSidebarCollapsed ? "Đăng xuất" : undefined}
                style={{ padding: isSidebarCollapsed ? '10px 0' : '8px 12px' }}
              >
                <span className="material-symbols-outlined fs-5" style={{ margin: 0 }}>logout</span>
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </aside>

          {/* Right side container: Main Content + Footer */}
          <div className="d-flex flex-column flex-grow-1 position-relative" style={{ overflowX: 'hidden', minHeight: 'calc(100vh - 80px)' }}>
            <main className={`flex-grow-1 ${isHomePage ? 'p-0' : 'p-4 p-md-5'}`} style={{ overflowX: 'hidden' }}>
              {children || <Outlet />}
            </main>

            <AdminFooter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-container d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: 'var(--ho-bg-cream, #f6f3f2)' }}>
      {/* Reusable top header */}
      <DashboardHeader 
        user={user} 
        profile={profile} 
        navLinks={navLinks} 
        logout={logout} 
      />

      <div className="d-flex flex-grow-1 w-100 position-relative">
        {/* Main content body */}
        <main className={`flex-grow-1 ${isHomePage ? 'p-0' : 'p-4 p-md-5'}`} style={{ minHeight: 'calc(100vh - 80px)', overflowX: 'hidden' }}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
