import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { signupAPI } from '../services/auth';

export function useSignup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError(null);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleAgreeTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
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
    // BE password pattern validation: at least 1 uppercase and 1 special char
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~`|]).*$/;
    if (!passwordPattern.test(password)) {
      setError('Password must contain at least one uppercase letter and one special character (e.g. @, #, $, !).');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Connect to the real backend register API. Role is hardcoded to SPECTATOR.
      const authData = await signupAPI({
        username: username.trim(),
        fullName: name.trim(),
        email: email.trim(),
        password,
        role: 'SPECTATOR',
      });
      
      login(authData);
      navigate('/spectator'); // Registered users default to SPECTATOR dashboard
    } catch (err) {
      setError(err.message || 'An error occurred during sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    alert('Google signup not configured in this test layout - please use the sign up form.');
  };

  return {
    username,
    name,
    email,
    password,
    agreeTerms,
    loading,
    error,
    handleUsernameChange,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleAgreeTermsChange,
    handleSubmit,
    handleGoogleSignup,
  };
}
