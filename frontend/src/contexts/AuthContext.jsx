import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('horse_racing_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('horse_racing_accessToken') || null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('horse_racing_refreshToken') || null;
  });

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, []);

  const login = (authData) => {
    const { accessToken: token, refreshToken: rToken, user: userData } = authData;
    
    setUser(userData);
    setAccessToken(token);
    setRefreshToken(rToken);
    
    localStorage.setItem('horse_racing_user', JSON.stringify(userData));
    localStorage.setItem('horse_racing_accessToken', token);
    localStorage.setItem('horse_racing_refreshToken', rToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    
    localStorage.removeItem('horse_racing_user');
    localStorage.removeItem('horse_racing_accessToken');
    localStorage.removeItem('horse_racing_refreshToken');
  };

  const updateTokens = (newAccessToken, newRefreshToken) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('horse_racing_accessToken', newAccessToken);
    localStorage.setItem('horse_racing_refreshToken', newRefreshToken);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      refreshToken, 
      login, 
      logout, 
      updateTokens,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
