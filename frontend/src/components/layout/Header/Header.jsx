import { useContext, useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown, Dropdown } from 'react-bootstrap';
import { FiBell, FiSettings, FiLogOut, FiCheckSquare, FiAlertCircle, FiInfo, FiPlusCircle, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import logo from '../../../assets/logo.png';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const username = user?.fullName || user?.name || user?.username || user?.email || '';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    if (user?.role === 'HORSE_OWNER') {
      navigate('/owner/profile');
    } else if (user?.role === 'JOCKEY') {
      navigate('/jockey/profile');
    } else if (user?.role === 'SPECTATOR') {
      navigate('/spectators/profile');
    } else if (user?.role === 'RACE_REFEREE') {
      navigate('/referee/profile');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/spectators/profile');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ROLE_UPGRADE': return <FiTrendingUp className="text-info" />;
      case 'CONNECTION': return <FiPlusCircle className="text-success" />;
      case 'REGISTRATION': return <FiCheckSquare className="text-warning" />;
      case 'RACE_STATUS': return <FiInfo style={{ color: '#fd7e14' }} />;
      case 'WALLET': return <FiCreditCard className="text-success" />;
      case 'SYSTEM_ALERT': return <FiAlertCircle className="text-danger" />;
      default: return <FiInfo className="text-secondary" />;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Avatar logic: Get the first letter of name
  // If "Admin" -> "A", if "John Doe" -> "J"
  const getAvatarLetter = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('username');
    localStorage.removeItem('token'); // Clear token if it exists
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  return (
    <Navbar expand="md" variant="dark" className="py-2 shadow-sm" style={{ backgroundColor: '#112211', sticky: 'top', zIndex: 1050 }}>
      <Container fluid="lg">
        {/* LOGO: Changed from Equine Elite Pro to Horse Racing */}
        <Navbar.Brand href="/" className="fw-bold d-flex align-items-center">
          <img src={logo} alt="EquineElite Logo" style={{ height: '48px', width: 'auto' }} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="header-nav" />

        <Navbar.Collapse id="header-nav" className="justify-content-between">
          {/* MAIN MENU CENTER */}
            <Nav className="mx-auto gap-lg-4 text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>
            <Nav.Link onClick={() => navigate('/tournaments')} className="text-white-50 cursor-pointer">Tournaments & Races</Nav.Link>
            <Nav.Link onClick={() => navigate('/live')} className="text-white-50 cursor-pointer">Live Simulation</Nav.Link>
            <Nav.Link onClick={() => {
              if (user) {
                if (user.role === 'HORSE_OWNER') navigate('/owner/wallet');
                else navigate('/spectators/wallet');
              } else {
                navigate('/login?redirect=/spectators/wallet');
              }
            }} className="text-white-50 cursor-pointer">Wallet & Transactions</Nav.Link>
            <Nav.Link href="#rankings" className="text-white-50 cursor-pointer">Ranking</Nav.Link>
          </Nav>

          {/* FEATURES SECTION RIGHT */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <Dropdown align="end" className="notification-dropdown">
                  <Dropdown.Toggle as="div" className="position-relative cursor-pointer hover-white d-flex align-items-center">
                    <FiBell size={20} className="text-white-50 hover-white" />
                    {unreadCount > 0 && (
                      <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute d-flex align-items-center justify-content-center" 
                        style={{ 
                          top: '-8px', 
                          right: '-8px', 
                          fontSize: '0.65rem',
                          minWidth: '16px',
                          height: '16px',
                          padding: '2px',
                          fontWeight: 'bold',
                          border: '2px solid #112211'
                        }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu 
                    className="p-0 shadow-lg border-0" 
                    style={{ 
                      width: '340px', 
                      backgroundColor: '#1c2e24', 
                      color: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      zIndex: 1060
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary" style={{ backgroundColor: '#112211' }}>
                      <h6 className="m-0 fw-bold text-white">Notifications</h6>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead} 
                          className="btn btn-link text-warning text-decoration-none p-0 fw-semibold"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-white-50" style={{ fontSize: '0.85rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                            className={`d-flex gap-3 p-3 border-bottom border-secondary-subtle cursor-pointer notif-item ${
                              !notif.isRead ? 'bg-secondary bg-opacity-25' : ''
                            }`}
                            style={{ 
                              transition: 'background-color 0.2s',
                              fontSize: '0.85rem',
                              borderLeft: !notif.isRead ? '3px solid #ffc107' : '3px solid transparent'
                            }}
                          >
                            <div className="fs-5 mt-1">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-grow-1">
                              <div className={`text-white ${!notif.isRead ? 'fw-bold' : ''}`}>
                                {notif.title}
                              </div>
                              <div className="text-white-50 mt-1" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                                {notif.content}
                              </div>
                              <div className="text-muted mt-2" style={{ fontSize: '0.7rem' }}>
                                {formatTime(notif.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="text-center p-2 border-top border-secondary" style={{ backgroundColor: '#112211' }}>
                      <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                        Real-time alerts enabled
                      </span>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Settings */}
                <FiSettings size={20} className="text-white-50 cursor-pointer hover-white" />

                {/* USER PROFILE DROPDOWN */}
                <div className="d-flex align-items-center gap-2 ms-2 ps-3 border-start border-secondary position-relative" ref={dropdownRef}>
                  <div 
                    className="d-flex align-items-center gap-3 cursor-pointer" 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="d-flex flex-column text-end d-none d-sm-flex">
                      <span className="fs-7 fw-bold text-white lh-sm">
                        {user?.fullName || 'User Profile'}
                      </span>
                      <span className="fw-bold text-white-50 text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                        {user?.role || 'User'}
                      </span>
                    </div>
                    <div className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderColor: 'rgba(255,255,255,0.2)' }}>
                      <img
                        alt="User Profile Avatar"
                        className="w-100 h-100 object-fit-cover"
                        src={user?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                      />
                    </div>
                  </div>

                  {dropdownOpen && (
                    <div 
                      className="position-absolute" 
                      style={{
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: '220px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        padding: '12px 0',
                        zIndex: 1060,
                        animation: 'fadeInDown 0.2s ease-out'
                      }}
                    >
                      <div style={{ padding: '4px 16px 8px 16px', fontSize: '12px', fontWeight: '600', color: '#718096' }}>
                        Account Actions
                      </div>
                      <button 
                        onClick={handleProfileClick} 
                        onMouseEnter={() => setProfileHover(true)}
                        onMouseLeave={() => setProfileHover(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '14.5px',
                          fontWeight: '500',
                          color: profileHover ? '#1a202c' : '#2d3748',
                          backgroundColor: profileHover ? '#f7fafc' : 'transparent',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>person</span>
                        My Profile
                      </button>
                      
                      <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />
                      
                      <button 
                        onClick={handleLogout} 
                        onMouseEnter={() => setLogoutHover(true)}
                        onMouseLeave={() => setLogoutHover(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '14.5px',
                          fontWeight: '500',
                          color: '#dc3545',
                          backgroundColor: logoutHover ? '#fff5f5' : 'transparent',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <span className="material-symbols-outlined me-2 text-danger" style={{ fontSize: '18px' }}>logout</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-2">
                <button 
                  onClick={() => navigate(`/login?redirect=${location.pathname}`)}
                  className="btn btn-warning fw-bold px-3 shadow-sm"
                  style={{ 
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #ffc107 0%, #e2b740 100%)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#112211'
                  }}
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate(`/signup?redirect=${location.pathname}`)}
                  className="btn btn-link text-white-50 text-decoration-none hover-white px-3 fw-semibold"
                  style={{ fontSize: '0.85rem' }}
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>

      {/* Inline CSS helper for custom hover effects */}
      <style>{`
        .nav-link:hover { color: #fff !important; }
        .hover-white:hover { color: #fff !important; transition: 0.3s; }
        .no-caret .dropdown-toggle::after { display: none; }
        .dropdown-menu { background-color: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .notification-dropdown .dropdown-toggle::after { display: none !important; }
        .notification-dropdown .dropdown-menu { border: 1px solid rgba(255,255,255,0.1) !important; }
        .notif-item { border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        .notif-item:hover { background-color: rgba(255, 255, 255, 0.08) !important; }
      `}</style>
    </Navbar>
  );
};

export default Header;