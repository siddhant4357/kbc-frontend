import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';
import kbcLogo from '../assets/kbc-logo.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const passcodeRefs = [useRef(), useRef(), useRef(), useRef()];

  // Focus the first passcode input on component mount
  useEffect(() => {
    const userInput = document.getElementById('username-input');
    if (userInput) userInput.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passcode.length !== 4) {
      setError('Passcode must be 4 digits');
      return;
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Handle backspace key
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      passcodeRefs[index - 1].current.focus();
    }
  };

  return (
    <>
      <style>
        {`
          .login-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #000B3E, #4C1D95);
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
          }

          .login-card {
            width: 100%;
            max-width: 34rem;
            background: rgba(11, 29, 120, 0.85);
            border: 1px solid rgba(255, 184, 0, 0.3);
            border-radius: 1.5rem;
            padding: 2.5rem 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
            transform: translateY(0);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: cardEntrance 0.6s ease-out;
          }

          @keyframes cardEntrance {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .login-card:hover {
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
            transform: translateY(-5px);
          }

          .logo-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 2.5rem;
          }

          .logo {
            width: 7rem;
            height: 7rem;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #FFB800;
            box-shadow: 0 0 25px rgba(255, 184, 0, 0.4);
            margin-bottom: 1.5rem;
            animation: pulse 3s infinite;
          }

          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 184, 0, 0.7);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(255, 184, 0, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 184, 0, 0);
            }
          }

          .app-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #FFB800;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.075em;
            margin: 0;
          }

          .app-subtitle {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.95rem;
            margin-top: 0.5rem;
          }

          .input-group {
            position: relative;
            margin-bottom: 1.75rem;
          }

          .input-label {
            display: block;
            color: #FFB800;
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 0.75rem;
            transition: all 0.2s;
          }

          .input-field {
            width: 90%;
            padding: 1rem 1.25rem;
            background: rgba(0, 11, 62, 0.6);
            border: 2px solid rgba(28, 63, 170, 0.5);
            border-radius: 0.75rem;
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .input-field:focus {
            outline: none;
            border-color: #FFB800;
            box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.25);
            background: rgba(0, 11, 62, 0.8);
          }

          .input-field::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          .passcode-container {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            margin-top: 0.75rem;
          }

          .passcode-input {
            width: 3.5rem;
            height: 4rem;
            text-align: center;
            font-size: 1.75rem;
            font-weight: 600;
            background: rgba(0, 11, 62, 0.6);
            border: 2px solid rgba(28, 63, 170, 0.5);
            border-radius: 0.75rem;
            color: white;
            transition: all 0.3s ease;
            caret-color: #FFB800;
          }

          .passcode-input:focus {
            outline: none;
            border-color: #FFB800;
            box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.25);
            background: rgba(0, 11, 62, 0.8);
            transform: scale(1.05);
          }

          .error-message {
            background: rgba(220, 38, 38, 0.2);
            color: #FCA5A5;
            padding: 1rem;
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            border: 1px solid rgba(220, 38, 38, 0.3);
            display: flex;
            align-items: center;
            animation: fadeIn 0.3s ease-in;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .error-icon {
            margin-right: 0.75rem;
            flex-shrink: 0;
          }

          .submit-button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #1C3FAA, #0B1D78);
            color: white;
            border: 2px solid #FFB800;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 1.1rem;
            letter-spacing: 0.03em;
            transition: all 0.3s ease;
            cursor: pointer;
            margin-top: 2rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .submit-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #0B1D78, #1C3FAA);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(28, 63, 170, 0.4);
          }

          .submit-button:active:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(28, 63, 170, 0.3);
          }

          .submit-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .loader-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }

          .loader {
            animation: spin 1.5s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (min-width: 640px) {
            .login-card {
              padding: 3rem;
            }
            
            .logo {
              width: 8rem;
              height: 8rem;
            }
            
            .app-title {
              font-size: 2.25rem;
            }
            
            .passcode-container {
              gap: 1rem;
            }
            
            .passcode-input {
              width: 4rem;
              height: 4.5rem;
              font-size: 2rem;
            }
          }
        `}
      </style>

      <div className="login-container">
        <div className="login-card">
          <div className="logo-container">
            <img 
              src={kbcLogo} 
              alt="KBC Logo" 
              className="logo"
            />
            <h1 className="app-title">
              Welcome to KBC Quiz
            </h1>
            <p className="app-subtitle">
              Sign in to continue your quiz journey
            </p>
          </div>

          {error && (
            <div className="error-message">
              <svg className="error-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="9" stroke="#FCA5A5" strokeWidth="2"/>
                <path d="M10 6V11" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="10" cy="14" r="1" fill="#FCA5A5"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="username-input">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                4-Digit Passcode
              </label>
              <div className="passcode-container">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={passcodeRefs[index]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={passcode[index] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/\D/g, '');
                      
                      // Update the passcode state regardless of whether there's a value or not
                      setPasscode(current => {
                        const updated = current.split('');
                        updated[index] = newValue; // This will be empty string if deleted
                        return updated.join('');
                      });
                      
                      // Only move focus to next input if there's a value
                      if (newValue && index < 3 && passcodeRefs[index + 1].current) {
                        passcodeRefs[index + 1].current.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Enhanced key handling
                      if (e.key === 'Backspace') {
                        // If current field is empty and not the first field, go to previous field
                        if (!passcode[index] && index > 0) {
                          passcodeRefs[index - 1].current.focus();
                        } 
                        // If current field has a value, clear it but stay in the same field
                        else if (passcode[index]) {
                          setPasscode(current => {
                            const updated = current.split('');
                            updated[index] = '';
                            return updated.join('');
                          });
                        }
                      }
                      // Arrow navigation between fields
                      else if (e.key === 'ArrowLeft' && index > 0) {
                        passcodeRefs[index - 1].current.focus();
                      }
                      else if (e.key === 'ArrowRight' && index < 3) {
                        passcodeRefs[index + 1].current.focus();
                      }
                    }}
                    className="passcode-input"
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <div className="loader-container">
                  <svg className="loader" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Login / Register'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;