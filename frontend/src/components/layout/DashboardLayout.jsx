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
                  style={{ width: '38px', height: '38px', borderColor: 'var(--ho-accent-gold, #D4AF37)', cursor: 'pointer' }}
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

              {/* Notification Bell next to Avatar/Profile */}
              <div className="position-relative ms-auto">
                <button
                  onClick={() => setSidebarNotifOpen(!sidebarNotifOpen)}
                  className="btn p-0 d-flex align-items-center justify-content-center position-relative border-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: sidebarNotifOpen ? 'var(--ho-accent-gold, #D4AF37)' : 'rgba(255, 255, 255, 0.12)',
                    color: sidebarNotifOpen ? '#000000' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  title="System notifications"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute badge rounded-pill bg-danger text-white border border-dark"
                      style={{ top: '-4px', right: '-4px', fontSize: '9px', padding: '2px 4px' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu for Sidebar Notifications */}
                {sidebarNotifOpen && (
                  <div
                    className="position-fixed shadow-lg rounded-3 overflow-hidden"
                    style={{
                      bottom: '20px',
                      left: isSidebarCollapsed ? '90px' : '270px',
                      width: '360px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      zIndex: 9999,
                      border: '1px solid var(--ho-accent-gold, #D4AF37)',
                      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div 
                      className="d-flex justify-content-between align-items-center p-3 border-bottom text-white"
                      style={{ backgroundColor: 'var(--ho-primary-dark, #003820)' }}
                    >
                      <h6 className="m-0 fw-bold d-flex align-items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--ho-accent-gold-hover, #fed65b)' }}>
                        <span className="material-symbols-outlined fs-5">notifications</span>
                        System Notifications
                      </h6>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead && markAllAsRead()}
                          className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                          style={{ fontSize: '0.75rem', color: 'var(--ho-primary-light, #95d4ac)' }}
                        >
                          Mark as read ({unreadCount})
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.isRead && markAsRead) markAsRead(notif.id);
                              if (notif.content?.toLowerCase().includes('tournament') || notif.title?.toLowerCase().includes('assignment') || notif.content?.toLowerCase().includes('tournament') || notif.title?.toLowerCase().includes('assignment')) {
                                navigate('/admin/tournamentmanagement');
                                setSidebarNotifOpen(false);
                              }
                            }}
                            className="d-flex gap-3 p-3 border-bottom text-start cursor-pointer"
                            style={{
                              backgroundColor: notif.isRead ? '#ffffff' : '#fffdf5',
                              transition: 'all 0.2s ease',
                              fontSize: '0.83rem',
                              borderLeft: !notif.isRead ? '4px solid var(--ho-accent-gold, #D4AF37)' : '4px solid transparent',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="flex-shrink-0 mt-1">
                              <span className="material-symbols-outlined fs-5" style={{ color: notif.isRead ? '#6c757d' : '#d97706' }}>
                                {notif.type === 'SYSTEM_ALERT' ? 'warning' : 'info'}
                              </span>
                            </div>
                            <div className="flex-grow-1">
                              <div className={`text-dark ${!notif.isRead ? 'fw-bold' : 'fw-medium'}`} style={{ fontSize: '0.86rem' }}>
                                {notif.title}
                              </div>
                              <div className="text-secondary mt-1" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                {notif.content}
                              </div>
                              <div className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-US') : ''}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout button at the bottom */}
            <div className="px-3 pt-2 admin-sidebar-footer">
              <button
                className={`btn btn-outline-danger btn-sm text-start d-flex align-items-center gap-2 p-2 w-100 rounded-3 admin-sidebar-logout-btn ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
                onClick={logout}
                title={isSidebarCollapsed ? "Logout" : undefined}
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
