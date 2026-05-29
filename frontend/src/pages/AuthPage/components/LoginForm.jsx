import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { useLogin } from '../../../hooks/useLogin';

export default function LoginForm() {
  const {
    identifier,
    password,
    loading,
    error,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleFailure,
  } = useLogin();

  return (
    <div className="auth-form-card">
      <h2 className="login-card-title">Login</h2>
      
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Please enter your Email"
          value={identifier}
          onChange={handleIdentifierChange}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.94 6.94a1.5 1.5 0 011.06-.44h12a1.5 1.5 0 011.06.44l-6.36 6.36a1.5 1.5 0 01-2.12 0L2.94 6.94z" />
              <path d="M2 9.5a1.5 1.5 0 01.44-1.06l6.36 6.36a2.5 2.5 0 003.54 0l6.36-6.36A1.5 1.5 0 0118.5 9.5v5A1.5 1.5 0 0117 16H3a1.5 1.5 0 01-1.5-1.5v-5z" />
            </svg>
          }
        />


        <Input
          type="password"
          placeholder="Please enter your Password"
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />

        <div className="submit-container">
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>

      <div className="divider">OR</div>

      <div className="google-btn-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          theme="outline"
          size="large"
          width="374"
        />
      </div>

      <div className="login-signup-link-container">
        <span>Don't have an account? </span>
        <Link to="/signup" className="signup-link">Sign up</Link>
      </div>
    </div>
  );
}
