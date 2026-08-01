import { useContext, useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { FiBell, FiSettings, FiCreditCard, FiCheckSquare, FiAlertCircle, FiInfo, FiPlusCircle, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import logo from '../../../assets/logo.png';

const roleNavConfigs = {
  SPECTATOR: {
    label: 'Spectator Hub',
    badgeBg: '#3b82f6',
    links: [
      { path: '/spectators/profile', label: 'Home', icon: 'home' },
      { path: '/spectators/wallet', label: 'Wallet & Cash', icon: 'account_balance_wallet' },
      { path: '/spectators/upgrade', label: 'Upgrade Role', icon: 'manage_accounts' },
    ]
  },
  HORSE_OWNER: {
    label: 'Horse Owner Suite',
    badgeBg: '#ffd700',
    badgeColor: '#07150c',
    links: [
      { path: '/owner/dashboard', label: 'Home', icon: 'home' },
      { path: '/owner/stable', label: 'My Stable', icon: 'bedroom_child' },
      { path: '/owner/entries', label: 'Race Entries', icon: 'emoji_events' },
      { path: '/owner/friends', label: 'Connections', icon: 'group' },
      { path: '/owner/financials', label: 'Financials & Wallet', icon: 'account_balance_wallet' },
    ]
  },
  JOCKEY: {
    label: 'Jockey Suite',
    badgeBg: '#10b981',
    links: [
      { path: '/jockey/dashboard', label: 'Home', icon: 'home' },
      { path: '/jockey/races', label: 'My Rides', icon: 'sports_score' },
      { path: '/jockey/invitations', label: 'Invitations', icon: 'mail' },
      { path: '/jockey/profile', label: 'Profile', icon: 'person' },
      { path: '/spectators/wallet', label: 'Wallet & Cash', icon: 'account_balance_wallet' },
    ]
  },
  RACE_REFEREE: {
    label: 'Referee Steward Suite',
    badgeBg: '#ef4444',
    links: [
      { path: '/referee/pre-race-check', label: 'Pre-Race Check', icon: 'fact_check' },
      { path: '/referee/live-simulation', label: 'Live Simulation', icon: 'sports_score' },
      { path: '/referee/confirm-results', label: 'Confirm Results', icon: 'verified' },
      { path: '/referee/violations', label: 'Violations & Flags', icon: 'gavel' },
      { path: '/referee/profile', label: 'Referee Profile', icon: 'person' },
    ]
  }
};

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);
  const [navSlide, setNavSlide] = useState('main'); // 'main' or 'role'
  const [isSliding, setIsSliding] = useState(false);
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

  const currentRoleConfig = user?.role ? roleNavConfigs[user.role] : null;

  useEffect(() => {
    if (user && currentRoleConfig?.links?.some(link => location.pathname === link.path || location.pathname.startsWith(link.path))) {
      setNavSlide('role');
    } else {
      setNavSlide('main');
    }
  }, [location.pathname, user?.role]);

  const handleToggleNavSlide = (targetMode) => {
    setIsSliding(true);
    setTimeout(() => {
      setNavSlide(targetMode);
      setIsSliding(false);
    }, 180);
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

  const handleLogout = () => {
    logout();
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky-top" style={{ zIndex: 1050 }}>
      {/* 1. TOP PRIMARY NAVIGATION BAR */}
      <Navbar expand="lg" variant="dark" className="py-2 shadow-sm" style={{ backgroundColor: '#143422', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
        <Container fluid="lg">
          {/* LOGO BRAND */}
          <Navbar.Brand href="/" className="fw-bold d-flex align-items-center gap-2">
            <img src={logo} alt="Horse Racing Logo" style={{ height: '44px', width: 'auto' }} />
            <span className="d-none d-sm-inline-block text-white fw-extrabold" style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              Horse <span style={{ color: '#ffd700' }}>Racing</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="header-nav" />

          <Navbar.Collapse id="header-nav" className="justify-content-between">
            {/* MIDDLE NAVIGATION WITH SMOOTH SLIDE TRANSITION */}
            <div className="mx-auto overflow-hidden position-relative py-1" style={{ maxWidth: '840px', minHeight: '38px', display: 'flex', alignItems: 'center' }}>
              <div 
                className="d-flex align-items-center gap-2 gap-xl-3 flex-nowrap"
                style={{
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.18s ease, transform 0.18s ease',
                  opacity: isSliding ? 0 : 1,
                  transform: isSliding ? (navSlide === 'main' ? 'translateX(15px)' : 'translateX(-15px)') : 'translateX(0)',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                {navSlide === 'main' || !user || !currentRoleConfig ? (
                  <>
                    {/* MAIN SYSTEM NAVIGATION LINKS */}
                    <Nav.Link onClick={() => navigate('/')} className={`cursor-pointer px-2 text-uppercase ${isActive('/') ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'}`}>
                      Homepage
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/tournaments')} className={`cursor-pointer px-2 text-uppercase ${isActive('/tournaments') ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'}`}>
                      Tournaments & Races
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/live')} className={`cursor-pointer px-2 text-uppercase ${isActive('/live') ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'}`}>
                      Live Simulation
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/rules')} className={`cursor-pointer px-2 text-uppercase ${isActive('/rules') ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'}`}>
                      Racing Rules
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/careers')} className={`cursor-pointer px-2 text-uppercase ${isActive('/careers') ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'}`}>
                      Careers
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/news')} className={`cursor-pointer px-2 text-uppercase ${isActive('/news') ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'}`}>
                      News & About
                    </Nav.Link>

                    {/* SLIDE TO ROLE MENU BUTTON */}
                    {user && currentRoleConfig && (
                      <button
                        onClick={() => handleToggleNavSlide('role')}
                        className="btn btn-sm d-inline-flex align-items-center justify-content-center fw-bold text-warning ms-1 shadow-sm transition-all flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(255, 215, 0, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          padding: '0'
                        }}
                        title={`Go to ${currentRoleConfig.label}`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* BACK TO MAIN MENU BUTTON */}
                    <button
                      onClick={() => handleToggleNavSlide('main')}
                      className="btn btn-sm d-inline-flex align-items-center justify-content-center fw-bold text-white me-1 shadow-sm transition-all flex-shrink-0"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        padding: '0'
                      }}
                      title="Back to Main Navigation"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                    </button>

                    {/* ROLE SPECIFIC NAVIGATION LINKS */}
                    {currentRoleConfig.links.map((link) => {
                      const active = isActive(link.path);
                      return (
                        <Nav.Link
                          key={link.path}
                          onClick={() => navigate(link.path)}
                          className={`cursor-pointer px-2 d-inline-flex align-items-center gap-1.5 ${
                            active ? 'text-warning fw-bold border-bottom border-warning' : 'text-white-50'
                          }`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{link.icon}</span>
                          <span>{link.label}</span>
                        </Nav.Link>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT SIDE USER CONTROLS */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              {user ? (
                <>
                  {/* NOTIFICATIONS BELL */}
                  <Dropdown align="end" className="notification-dropdown">
                    <Dropdown.Toggle as="div" className="position-relative cursor-pointer hover-white d-flex align-items-center p-1">
                      <FiBell size={20} className="text-white-50 hover-white" />
                      {unreadCount > 0 && (
                        <Badge 
                          bg="danger" 
                          pill 
                          className="position-absolute d-flex align-items-center justify-content-center" 
                          style={{ 
                            top: '-4px', 
                            right: '-4px', 
                            fontSize: '0.65rem',
                            minWidth: '16px',
                            height: '16px',
                            padding: '2px',
                            fontWeight: 'bold',
                            border: '2px solid #07150c'
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
                        backgroundColor: '#143422', 
                        color: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        zIndex: 1060
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary" style={{ backgroundColor: '#1b4f32' }}>
                        <h6 className="m-0 fw-bold text-white">Notifications</h6>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead} 
                            className="btn btn-link text-warning text-decoration-none p-0 fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Mark all as read
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
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* USER PROFILE DROPDOWN */}
                  <div className="d-flex align-items-center gap-2 ms-1 ps-2 border-start border-secondary position-relative" ref={dropdownRef}>
                    <div 
                      className="d-flex align-items-center gap-2 cursor-pointer" 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="d-flex flex-column text-end d-none d-sm-flex">
                        <span className="fs-7 fw-bold text-white lh-sm">
                          {user?.fullName || user?.name || user?.username || 'User Profile'}
                        </span>
                        <span className="fw-bold text-warning text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                          {user?.role ? user.role.replace('_', ' ') : 'USER'}
                        </span>
                      </div>
                      <div className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', borderColor: '#ffd700' }}>
                        <img
                          alt="User Avatar"
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
                          width: '230px',
                          backgroundColor: '#143422',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          padding: '8px 0',
                          zIndex: 1060,
                          color: '#fff'
                        }}
                      >
                        <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: '700', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {user?.fullName || 'Account'} ({user?.role})
                        </div>

                        <button 
                          onClick={() => { setDropdownOpen(false); navigate('/spectators/profile'); }} 
                          onMouseEnter={() => setProfileHover(true)}
                          onMouseLeave={() => setProfileHover(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#ffffff',
                            backgroundColor: profileHover ? 'rgba(212,175,55,0.2)' : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <span className="material-symbols-outlined me-2 text-warning" style={{ fontSize: '18px' }}>person</span>
                          My Profile
                        </button>
                        
                        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />
                        
                        <button 
                          onClick={handleLogout} 
                          onMouseEnter={() => setLogoutHover(true)}
                          onMouseLeave={() => setLogoutHover(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#ef4444',
                            backgroundColor: logoutHover ? 'rgba(239,68,68,0.15)' : 'transparent',
                            border: 'none',
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
                      background: 'linear-gradient(135deg, #ffd700 0%, #e2b740 100%)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#07150c'
                    }}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate(`/signup?redirect=${location.pathname}`)}
                    className="btn btn-outline-light text-decoration-none px-3 fw-semibold"
                    style={{ fontSize: '0.85rem', borderRadius: '6px' }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .nav-link:hover { color: #ffd700 !important; }
        .hover-white:hover { color: #fff !important; transition: 0.3s; }
        .notification-dropdown .dropdown-toggle::after { display: none !important; }
        .notif-item:hover { background-color: rgba(255, 255, 255, 0.08) !important; }
      `}</style>
    </header>
  );
};

export default Header;