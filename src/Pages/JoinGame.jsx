import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

// Replace ADMIN_ACCOUNTS with single admin check
const ADMIN_PASSCODE = '4321';

const JoinGame = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankPasscode, setBankPasscode] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Define colors - matches the KBC theme
  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
    light: '#E5E9FF',
    purple: '#4C1D95',
    red: '#EF4444'
  };

  // All styles defined inline
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      padding: '1rem',
      background: `radial-gradient(circle at center, ${colors.purple}15 0%, ${colors.darkBlue}15 100%)`,
      fontFamily: "'Poppins', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    },
    card: {
      maxWidth: '36rem',
      width: '100%',
      margin: '0 auto',
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    title: {
      color: colors.gold,
      fontSize: '2.25rem',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    },
    errorContainer: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#FCA5A5',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    formCard: {
      background: `linear-gradient(135deg, rgba(11, 29, 120, 0.7), rgba(0, 11, 62, 0.7))`,
      border: `1px solid ${colors.lightBlue}`,
      boxShadow: `0 0 10px rgba(28, 63, 170, 0.2)`,
      padding: '1.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.3s ease',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      color: colors.gold,
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem',
    },
    select: {
      width: '100%',
      maxWidth: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0, 11, 62, 0.6)',
      border: '2px solid rgba(28, 63, 170, 0.5)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFB800'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1.5em',
      paddingRight: '2.5rem',
    },
    selectFocus: {
      outline: 'none',
      borderColor: colors.gold,
      boxShadow: '0 0 0 3px rgba(255, 184, 0, 0.25)',
      background: 'rgba(0, 11, 62, 0.8)',
    },
    selectOption: {
      backgroundColor: colors.darkBlue,
      color: colors.light,
      padding: '12px',
      minHeight: '40px',
      borderBottom: '1px solid rgba(255, 184, 0, 0.1)',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0, 11, 62, 0.6)',
      border: '2px solid rgba(28, 63, 170, 0.5)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
    },
    inputFocus: {
      outline: 'none',
      borderColor: colors.gold,
      boxShadow: '0 0 0 3px rgba(255, 184, 0, 0.25)',
      background: 'rgba(0, 11, 62, 0.8)',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center', // Changed to center for mobile
      marginTop: '1rem',
    },
    button: {
      background: `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`,
      color: colors.light,
      border: `1px solid ${colors.gold}`,
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '120px',
      width: '100%', // Full width on mobile
      maxWidth: '100%',
    },
    buttonHover: {
      background: `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(28, 63, 170, 0.3)',
    },
    buttonActive: {
      transform: 'translateY(1px)',
      boxShadow: 'none',
    },
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    fetchQuestionBanks();
  }, [navigate]);

  const fetchQuestionBanks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionbanks`, {
        credentials: 'include'
      });
      const data = await response.json();
      setQuestionBanks(data);
    } catch (error) {
      setError('Failed to load question banks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!selectedBank) {
      setError('Please select a question bank');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.username !== 'admin' || adminPasscode !== ADMIN_PASSCODE) {
      setError('Invalid admin credentials');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionBankId: selectedBank._id,
          passcode: bankPasscode,
          adminUsername: user.username // Add this to track which admin started the game
        }),
      });

      if (response.ok) {
        navigate(`/game-rules/${selectedBank._id}`);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      console.error('Join game error:', error);
      setError('Failed to join game');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* CSS animations and media queries */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @media (max-width: 640px) {
            .kbc-card {
              padding: 1.25rem 1rem !important;
              margin: 0.5rem;
            }
            .kbc-title {
              font-size: 1.5rem !important;
            }
            .kbc-button {
              padding: 0.875rem 1rem !important;
              font-size: 1rem !important;
              width: 100% !important;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 0.5rem;
            }
            .kbc-select, .kbc-input {
              font-size: 16px !important; /* Prevent zoom on iOS */
              padding: 0.875rem 1rem !important;
              height: 48px;
            }
            .form-card {
              padding: 1.25rem !important;
            }
            .form-group {
              margin-bottom: 1.25rem !important;
            }
            /* Fix for iOS touch targets */
            input, select, button {
              touch-action: manipulation;
            }
          }
          
          /* Active state for buttons on touch devices */
          @media (hover: none) {
            .kbc-button:active {
              transform: translateY(1px);
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div style={styles.card} className="kbc-card">
        <div style={styles.header}>
          <BackButton to="/dashboard" />
          <h1 style={styles.title} className="kbc-title">Join Game</h1>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div 
            style={styles.formCard} 
            className="form-card"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={styles.formGroup} className="form-group">
              <label style={styles.label}>Select Question Bank</label>
              <select
                value={selectedBank?._id || ''}
                onChange={(e) => setSelectedBank(questionBanks.find(bank => bank._id === e.target.value))}
                style={styles.select}
                className="kbc-select"
                required
                onFocus={(e) => Object.assign(e.target.style, styles.selectFocus)}
                onBlur={(e) => {
                  e.target.style.outline = '';
                  e.target.style.borderColor = 'rgba(28, 63, 170, 0.5)';
                  e.target.style.boxShadow = '';
                  e.target.style.background = 'rgba(0, 11, 62, 0.6)';
                }}
              >
                <option value="" disabled>Select a question bank</option>
                {questionBanks.map(bank => (
                  <option key={bank._id} value={bank._id}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup} className="form-group">
              <label style={styles.label}>Question Bank Passcode</label>
              <input
                type="password"
                inputMode="numeric"
                value={bankPasscode}
                onChange={(e) => setBankPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
                className="kbc-input"
                pattern="\d{4}"
                maxLength="4"
                placeholder="Enter question bank passcode"
                required
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.outline = '';
                  e.target.style.borderColor = 'rgba(28, 63, 170, 0.5)';
                  e.target.style.boxShadow = '';
                  e.target.style.background = 'rgba(0, 11, 62, 0.6)';
                }}
              />
            </div>

            <div style={styles.formGroup} className="form-group">
              <label style={styles.label}>
                Admin Passcode ({JSON.parse(localStorage.getItem('user'))?.username || 'Unknown User'})
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
                className="kbc-input"
                pattern="\d{4}"
                maxLength="4"
                placeholder="Enter your admin passcode"
                required
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.outline = '';
                  e.target.style.borderColor = 'rgba(28, 63, 170, 0.5)';
                  e.target.style.boxShadow = '';
                  e.target.style.background = 'rgba(0, 11, 62, 0.6)';
                }}
              />
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...(isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {})
              }}
              className="kbc-button"
              disabled={isSubmitting}
              onMouseOver={(e) => {
                if (!isSubmitting) Object.assign(e.target.style, styles.buttonHover);
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
                  e.target.style.transform = '';
                  e.target.style.boxShadow = '';
                }
              }}
              onTouchStart={(e) => {
                if (!isSubmitting) Object.assign(e.target.style, styles.buttonActive);
              }}
              onTouchEnd={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = '';
                  e.target.style.boxShadow = '';
                }
              }}
            >
              {isSubmitting ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGame;