// frontend/src/hooks/useAuth.js
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setIsAdmin(userData.isAdmin);
    }
  }, []);

  return { user, isAdmin };
};