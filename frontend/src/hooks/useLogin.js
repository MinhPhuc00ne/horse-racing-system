import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { loginAPI, googleLoginAPI, signupAPI } from '../services/auth';

export function useLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const redirectByRole = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'HORSE_OWNER') navigate('/owner');
    else if (role === 'JOCKEY') navigate('/jockey');
    else if (role === 'RACE_REFEREE') navigate('/referee');
    else navigate('/spectator');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!identifier.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Connect to the real backend login API
      const authData = await loginAPI(identifier.trim(), password);
      login(authData);
      
      const welcomeName = authData.user.fullName || authData.user.username || 'User';
      redirectByRole(authData.user.role);
    } catch (err) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Dummy logic for Google Login, or you can integrate standard Google credential response here
      // Normally we receive credential from Google Sign-In button, and send to googleLoginAPI
      alert('Google login not configured in this test layout - please use Email and Password');
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return {
    identifier,
    password,
    loading,
    error,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleLogin,
    redirectByRole,
  };
}
