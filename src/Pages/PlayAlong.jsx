import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const PlayAlong = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
    light: '#E5E9FF',
    purple: '#4C1D95',
    red: '#EF4444'
  };

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
      backgroundColor: colors.darkBlue,
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
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
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
      width: '100%',
    },
  };

  const pollGameState = async (bankId) => {
    try {
      const response = await fetch(`${API_URL}/api/game/${bankId}/status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error polling game state:', error);
    }
    return null;
  };

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
    if (!selectedBank) {
      setError('Please select a question bank');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionBankId: selectedBank._id,
          passcode
        }),
      });

      if (response.ok) {
        const gameState = await pollGameState(selectedBank._id);
        if (gameState) {
          navigate(`/play-game/${selectedBank._id}`);
        }
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      console.error('Join game error:', error);
      setError('Failed to join game');
    }
  };

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @media (max-width: 640px) {
            .kbc-card {
              padding: 1.25rem 1rem !important;
              margin: 0.5rem;
            }
            .kbc-title {
              font-size: 1.5rem !important;
            }
            .kbc-select, .kbc-input {
              font-size: 16px !important;
              padding: 0.875rem 1rem !important;
              height: 48px;
            }
            input, select, button {
              touch-action: manipulation;
            }
          }
          
          /* Style the select options */
          select option {
            background-color: ${colors.darkBlue};
            color: ${colors.light};
            padding: 12px;
            min-height: 40px;
            border-bottom: 1px solid rgba(255, 184, 0, 0.1);
          }
          
          /* Style the select when opened */
          select:focus {
            background-color: ${colors.darkBlue};
            border-color: ${colors.gold};
            box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.25);
          }
        `}
      </style>

      <div style={styles.card} className="kbc-card">
        <div style={styles.header}>
          <BackButton to="/dashboard" />
          <h1 style={styles.title} className="kbc-title">Join Play Along</h1>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formCard}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Question Bank</label>
              <select
                value={selectedBank?._id || ''}
                onChange={(e) => setSelectedBank(questionBanks.find(bank => bank._id === e.target.value))}
                style={styles.select}
                required
              >
                <option value="" disabled>Select a question bank</option>
                {questionBanks.map(bank => (
                  <option key={bank._id} value={bank._id} style={styles.selectOption}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Enter Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
                pattern="\d{4}"
                maxLength="4"
                placeholder="Enter 4-digit passcode"
                required
              />
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button
              type="submit"
              style={styles.button}
            >
              Start Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayAlong;