import { useContext } from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown, Dropdown } from 'react-bootstrap';
import { FiBell, FiSettings, FiLogOut, FiCheckSquare, FiAlertCircle, FiInfo, FiPlusCircle, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import logo from '../../assets/logo.png';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const username = user?.fullName || user?.name || user?.username || user?.email || '';

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

  // Logic xử lý Avatar: Lấy chữ cái đầu của tên
  // Nếu là "Admin" -> "A", nếu là "Nguyễn Văn An" -> "N"
  const getAvatarLetter = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('username');
    localStorage.removeItem('token'); // Nếu bạn có dùng token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  return (
    <Navbar expand="md" variant="dark" className="py-2 shadow-sm" style={{ backgroundColor: '#112211', sticky: 'top', zIndex: 1050 }}>
      <Container fluid="lg">
        {/* LOGO: Đổi từ Equine Elite Pro sang Horse Racing */}
        <Navbar.Brand href="/" className="fw-bold d-flex align-items-center">
          <img src={logo} alt="EquineElite Logo" style={{ height: '48px', width: 'auto' }} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="header-nav" />

        <Navbar.Collapse id="header-nav" className="justify-content-between">
          {/* MENU CHÍNH Ở GIỮA */}
          <Nav className="mx-auto gap-lg-4 text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>
            <Nav.Link href="#live" className="text-warning border-bottom border-warning">Live Races</Nav.Link>
            <Nav.Link href="#schedule" className="text-white-50">Schedule</Nav.Link>
            <Nav.Link href="#standings" className="text-white-50">Standings</Nav.Link>
            <Nav.Link href="#marketplace" className="text-white-50">Marketplace</Nav.Link>
          </Nav>

          {/* CỤM TÍNH NĂNG BÊN PHẢI */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Chuông thông báo */}
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

                {/* Cài đặt */}
                <FiSettings size={20} className="text-white-50 cursor-pointer hover-white" />

                {/* PHẦN USER: HIỂN THỊ ĐỘNG TÊN TỪ DATABASE/GOOGLE */}
                <div className="d-flex align-items-center gap-2 ms-2 ps-3 border-start border-secondary">
                  <div className="text-end d-none d-sm-block">
                    <div className="text-white-50" style={{ fontSize: '0.7rem' }}>
                      Welcome back,
                    </div>
                    <div className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>
                      {username}
                    </div>
                  </div>

                  {/* Avatar hình tròn chứa chữ cái đầu */}
                  <NavDropdown
                    title={
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold shadow-sm"
                        style={{ 
                          width: '38px', 
                          height: '38px', 
                          background: 'linear-gradient(135deg, #198754 0%, #ffc107 100%)',
                          color: '#fff',
                          fontSize: '1rem',
                          border: '2px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {getAvatarLetter(username || 'G')}
                      </div>
                    }
                    id="user-dropdown"
                    align="end"
                    className="no-caret"
                  >
                    <NavDropdown.Header>Account Actions</NavDropdown.Header>
                    <NavDropdown.Item href="#profile">My Profile</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2">
                      <FiLogOut /> Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-link text-white-50 text-decoration-none hover-white px-3 fw-semibold"
                  style={{ fontSize: '0.85rem' }}
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="btn btn-warning fw-bold px-3 shadow-sm"
                  style={{ 
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #ffc107 0%, #e2b740 100%)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#112211'
                  }}
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>

      {/* Thêm một chút CSS inline để xử lý hiệu ứng hover */}
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