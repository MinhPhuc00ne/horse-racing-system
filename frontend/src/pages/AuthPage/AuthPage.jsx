import { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoginForm from '../../components/Auth/LoginForm';
import SignupForm from '../../components/Auth/SignupForm';
import horseImage from '../../assets/horse_racing_statue.png';
import horseSignupImage from '../../assets/horse_racing_action.png';
import logo from '../../assets/logo.png';
import './AuthPage.css';

export default function AuthPage({ view }) {
  const isLogin = view === 'login';
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const searchParams = new URLSearchParams(window.location.search);
      let redirectUrl = searchParams.get('redirect') || sessionStorage.getItem('postLoginRedirect');
      
      if (redirectUrl) {
        sessionStorage.removeItem('postLoginRedirect');
        // If they are a spectator and the redirect was to public tournaments, redirect them to their dashboard version instead for better UX
        if (user.role === 'SPECTATOR' && redirectUrl === '/tournaments') {
            redirectUrl = '/spectator/tournaments';
        }
        navigate(redirectUrl);
      } else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'HORSE_OWNER') navigate('/owner');
      else if (user.role === 'JOCKEY') navigate('/jockey');
      else if (user.role === 'RACE_REFEREE') navigate('/referee');
      else navigate('/spectator');
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`auth-container ${isLogin ? 'mode-login' : 'mode-signup'}`}>
      
      {/* Absolute Logo at Top Left */}
      <Link to="/" style={{ position: 'absolute', top: '24px', left: '32px', zIndex: 100, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <img src={logo} alt="Horse Racing Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
      </Link>

      {/* Background Forms Container - Forms stay statically in their halves */}
      <div className="auth-forms-container">
        {/* Left Side Form Column - Login */}
        <div className="auth-form-column login-column">
          <div className="auth-form-wrapper">
            <Link to="/" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }} className="auth-header-link">
              <div className="auth-header-content">
                <h1 className="auth-title-brand mb-1">Welcome Back</h1>
                <p className="auth-subtitle mb-0">The pinnacle of tournament excellence.</p>
              </div>
            </Link>
            <LoginForm />
          </div>
        </div>

        {/* Right Side Form Column - Signup */}
        <div className="auth-form-column signup-column">
          <div className="auth-form-wrapper">
            <Link to="/" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }} className="auth-header-link">
              <div className="auth-header-content">
                <h1 className="auth-title-brand mb-1">Join the Elite</h1>
                <p className="auth-subtitle mb-0">Start your legacy in equine management.</p>
              </div>
            </Link>
            <SignupForm />
          </div>
        </div>
      </div>

      {/* Sliding Image Overlay Panel - Moves back and forth to reveal/cover */}
      <div className="auth-overlay-panel">
        <div className="auth-overlay-content-wrapper">
          {/* Background Image for Login */}
          <img
            src={horseImage}
            alt="Premium Horse Statue"
            className={`auth-bg-image login-bg ${isLogin ? 'active' : ''}`}
          />
          {/* Background Image for Signup */}
          <img
            src={horseSignupImage}
            alt="Dynamic Horse Racing"
            className={`auth-bg-image signup-bg ${!isLogin ? 'active' : ''}`}
          />

          <div className="auth-gradient-overlay"></div>
          <div className="auth-image-content">
            <div className="badge-live">
              <span className="badge-dot"></span>
              ROYAL ASCOT 2026 SEASON LIVE
            </div>
            <h2 className="auth-image-title">
              Heritage Meets <br /> Performance.
            </h2>
            <p className="auth-image-desc">
              Manage your stables, track race entries, and analyze real-time financial standings with the world's most sophisticated equine management platform.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
