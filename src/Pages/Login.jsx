import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';

const Login = () => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passcode.length !== 4) {
      setError('Passcode must be 4 digits');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, passcode }),
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="kbc-container">
      <div className="kbc-content max-w-md mx-auto mt-20 animate-slideUp">
        <div className="mb-8 text-center">
          <img 
            src="/src/assets/kbc-logo.png" 
            alt="KBC Logo" 
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="kbc-title">Welcome to KBC Quiz</h1>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-kbc-gold text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="kbc-input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-kbc-gold text-sm">4-Digit Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="kbc-input"
              pattern="\d{4}"
              maxLength="4"
              placeholder="Enter 4-digit passcode"
              required
            />
          </div>

          <button type="submit" className="kbc-button1 w-full">
            Login / Register
          </button>
        </form>

       
      </div>
    </div>
  );
};

export default Login;