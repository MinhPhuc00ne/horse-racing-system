import React, { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import DashboardHeader from './DashboardHeader';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import Footer from './Footer/Footer';
import './DashboardLayout.css';
import logo from '../../assets/logo.png';

export default function DashboardLayout({ navLinks, profile, children }) {
  const { user, logout } = useContext(AuthContext);
  const notificationCtx = useContext(NotificationContext);
  const notifications = notificationCtx?.notifications || [];
  const unreadCount = notificationCtx?.unreadCount || 0;
  const markAsRead = notificationCtx?.markAsRead;
  const markAllAsRead = notificationCtx?.markAllAsRead;

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarNotifOpen, setSidebarNotifOpen] = useState(false);
  const sidebarNotifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarNotifRef.current && !sidebarNotifRef.current.contains(event.target)) {
        setSidebarNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isHomePage = location.pathname.endsWith('/home') || location.pathname === '/';

  if (isAdmin) {
    return (
      <div className="admin-layout-container d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: '#051009', color: '#fff' }}>
        {/* Admin Header (Mobile only) */}
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
              transition: 'width 0.3s ease',
              backgroundColor: '#07150c',
              borderRight: '1px solid rgba(212, 175, 55, 0.25)'
            }}
          >
            {/* Logo / Branding in Sidebar */}
            <div className={`px-3 mb-3 pb-3 border-bottom admin-sidebar-brand-wrapper d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
              {!isSidebarCollapsed && (
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                  <img src={logo} alt="Horse Racing Logo" style={{ height: '45px', width: 'auto' }} />
                </div>
              )}
              {isSidebarCollapsed && (
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')} title="Horse Racing Pro">
                  <img src={logo} alt="Logo" style={{ height: '35px', width: 'auto' }} />
                </div>
              )}

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
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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

            {/* Profile info & Notification Bell in Sidebar */}
            <div
              className={`px-3 mb-2 mt-auto border-top pt-3 d-flex align-items-center justify-content-between position-relative ${isSidebarCollapsed ? 'flex-column justify-content-center gap-2' : ''}`}
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              ref={sidebarNotifRef}
            >
              <div className="d-flex align-items-center gap-3 overflow-hidden">
                <div
                  className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '38px', height: '38px', borderColor: '#ffd700', cursor: 'pointer' }}
                  onClick={() => navigate('/admin/dashboard')}
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
                    <span className="fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em', color: '#ffd700' }}>
                      {user?.role || 'ADMIN'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout button */}
            <div className="px-3 pt-2 admin-sidebar-footer">
              <button
                className={`btn btn-outline-danger btn-sm text-start d-flex align-items-center gap-2 p-2 w-100 rounded-3 ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
                onClick={logout}
                style={{ padding: isSidebarCollapsed ? '10px 0' : '8px 12px' }}
              >
                <span className="material-symbols-outlined fs-5" style={{ margin: 0 }}>logout</span>
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </aside>

          {/* Right side container */}
          <div className="d-flex flex-column flex-grow-1 position-relative" style={{ overflowX: 'hidden', minHeight: 'calc(100vh - 80px)' }}>
            <main className={`flex-grow-1 ${isHomePage ? 'p-0' : 'p-4 p-md-5'}`} style={{ overflowX: 'hidden' }}>
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Non-admin roles (Wrapped in MainLayout, so Header & Footer are rendered cleanly by MainLayout)
  return (
    <div className="dashboard-layout-container flex-grow-1 w-100" style={{ backgroundColor: '#051009', color: '#fff' }}>
      <main className={`flex-grow-1 ${isHomePage ? 'p-0' : 'p-4 p-md-5'}`} style={{ minHeight: 'calc(100vh - 120px)', overflowX: 'hidden' }}>
        {children || <Outlet />}
      </main>
    </div>
  );
}
