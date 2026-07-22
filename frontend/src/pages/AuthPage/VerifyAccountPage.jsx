import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyAccountAPI } from '../../services/auth';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import horseImage from '../../assets/horse_racing_statue.png';
import './AuthPage.css';

export default function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse email and token from query parameters
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const token = queryParams.get('token');

  const [otp, setOtp] = useState(token || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerify = async (e, forceToken = null) => {
    if (e) e.preventDefault();
    const tokenToVerify = forceToken || otp.trim();
    
    if (!tokenToVerify) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await verifyAccountAPI(tokenToVerify);
      setSuccess(res.message || 'Account activated successfully!');
      // Upon success, redirect to login page after 3s
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify(null, token);
    }
  }, [token]);

  return (
    <div className="auth-container mode-login">
      <div className="auth-forms-container">
        {/* Left Side Form Column */}
        <div className="auth-form-column login-column" style={{ opacity: 1, pointerEvents: 'auto', transform: 'scale(1)' }}>
          <div className="auth-form-wrapper">
            <div className="auth-header-content">
              <h1 className="auth-title-brand">Horse Racing</h1>
              <p className="auth-subtitle">Activate your account.</p>
            </div>
            
            <div className="auth-form-card">
              <h2 className="login-card-title">Verify Account</h2>
              
              {error && <div className="error-alert">{error}</div>}
              {success && (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', color: '#047857', padding: '0.75rem 1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontWeight: 500, textAlign: 'left' }}>
                  {success}
                </div>
              )}
              
              <div style={{textAlign: 'left', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.5'}}>
                {email ? (
                  <>A 6-digit OTP code has been sent to <strong>{email}</strong>. Please check your email and enter it below to activate your account.</>
                ) : (
                  <>Please check your email and enter the 6-digit OTP code below to activate your account.</>
                )}
              </div>
              
              <form onSubmit={handleVerify}>
                <Input 
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading || success}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
                />
                <div className="submit-container">
                   <Button type="submit" disabled={loading || success}>
                      {loading ? 'Verifying...' : 'Verify Account'}
                   </Button>
                </div>
              </form>

              <div className="login-signup-link-container" style={{ marginTop: '1.5rem' }}>
                <span 
                  className="signup-link" 
                  style={{ cursor: 'pointer', marginLeft: 0 }} 
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Empty space for overlay layout matching */}
        <div className="auth-form-column signup-column"></div>
      </div>

      {/* Right Side Image Overlay Panel */}
      <div className="auth-overlay-panel">
        <div className="auth-overlay-content-wrapper">
          <img
            src={horseImage}
            alt="Premium Horse Statue"
            className="auth-bg-image login-bg active"
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
