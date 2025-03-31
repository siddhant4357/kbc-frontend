import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';
import { useFirebaseGameState } from '../hooks/useFirebaseGameState';
import { ref, set } from 'firebase/database';
import { db } from '../utils/firebase';

const ManagePlayAlong = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState('');
  const [success, setSuccess] = useState('');
  const [timerDuration, setTimerDuration] = useState(15);
  const [pollInterval, setPollInterval] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { gameState, updateGameState } = useFirebaseGameState(selectedBank?._id);

  // Define theme colors
  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
    light: '#E5E9FF',
    purple: '#4C1D95',
    red: '#DC2626',
    darkRed: '#B91C1C',
    green: '#10B981',
  };

  // All component styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      padding: '1rem',
      background: `radial-gradient(circle at center, ${colors.purple}15 0%, ${colors.darkBlue}15 100%)`,
      fontFamily: "'Poppins', sans-serif",
    },
    contentContainer: {
      maxWidth: '72rem',
      margin: '0 auto',
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)',
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      color: colors.gold,
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    },
    successAlert: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      color: 'rgba(167, 243, 208, 1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    errorAlert: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: 'rgba(252, 165, 165, 1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
    },
    card: {
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      transition: 'all 0.3s ease',
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    },
    cardSubtitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: colors.gold,
      marginBottom: '1rem',
    },
    select: {
      width: '100%',
      maxWidth: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0, 11, 62, 0.6)',
      border: `2px solid rgba(28, 63, 170, 0.5)`,
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
    buttonContainer: {
      marginTop: '1.5rem',
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
    buttonHover: {
      background: `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(28, 63, 170, 0.3)',
    },
    redButton: {
      background: `linear-gradient(135deg, ${colors.red}, ${colors.darkRed})`,
    },
    redButtonHover: {
      background: `linear-gradient(135deg, ${colors.darkRed}, ${colors.red})`,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    pressedButton: {
      transform: 'scale(0.95)',
    },
    pulseAnimation: {
      animation: 'pulse 2s infinite',
    },
    questionCard: {
      backgroundColor: 'rgba(0, 11, 62, 0.2)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
    },
    questionLabel: {
      color: colors.gold,
      fontWeight: 500,
      marginBottom: '0.5rem',
    },
    questionText: {
      color: 'white',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '1rem',
    },
    gridMd: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1rem',
    },
    timerCard: {
      padding: '1rem',
      borderRadius: '0.5rem',
      background: 'rgba(11, 29, 120, 0.7)',
      border: `1px solid ${colors.lightBlue}`,
    },
    timerLabel: {
      display: 'block',
      color: colors.gold,
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    timerInputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      maxWidth: '150px',
    },
    timerInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      paddingRight: '3rem', // Make room for the "sec" indicator
      background: 'rgba(0, 11, 62, 0.6)',
      border: `2px solid rgba(28, 63, 170, 0.5)`,
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      appearance: 'none', // Remove browser default styling
      MozAppearance: 'textfield', // Firefox
    },
    timerUnit: {
      position: 'absolute',
      right: '1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      pointerEvents: 'none', // Ensures clicks pass through to the input
    },
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    fetchQuestionBanks();
  }, [navigate]);

  useEffect(() => {
    // Test Firebase connection
    const testRef = ref(db, 'test');
    set(testRef, {
      timestamp: Date.now(),
      message: 'Connection test',
    })
      .then(() => {
        console.log('Firebase connection successful');
      })
      .catch((error) => {
        console.error('Firebase connection failed:', error);
        setError('Failed to connect to Firebase');
      });
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionbanks`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      setQuestionBanks(data);
    } catch (error) {
      console.error('Error fetching question banks:', error);
    }
  };

  const handleBankSelect = async (bankId) => {
    const bank = questionBanks.find((b) => b._id === bankId);
    setSelectedBank(bank);
    setCurrentQuestionIndex(0);
    setGameStarted(false);
  };

  const startGame = async () => {
    if (selectedBank) {
      await updateGameState({
        isActive: true,
        currentQuestion: {
          ...selectedBank.questions[0],
          questionIndex: 0,
        },
        showOptions: false,
        showAnswer: false,
        timerStartedAt: null,
        timerDuration: parseInt(timerDuration),
        players: {},
        startedAt: Date.now(),
      });
      setGameStarted(true);
    }
  };

  const showNextQuestion = async () => {
    if (gameStarted && currentQuestionIndex < selectedBank.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      await updateGameState({
        currentQuestion: {
          ...selectedBank.questions[nextIndex],
          questionIndex: nextIndex,
        },
        showOptions: false,
        showAnswer: false,
        timerStartedAt: null,
      });
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const showOptions = async () => {
    if (gameStarted) {
      await updateGameState({
        showOptions: true,
        timerStartedAt: Date.now(),
        timerDuration: parseInt(timerDuration),
      });
    }
  };

  const showAnswer = async () => {
    if (gameStarted) {
      await updateGameState({
        showAnswer: true,
      });
    }
  };

  const stopGame = async () => {
    await updateGameState({
      isActive: false,
      currentQuestion: null,
      showOptions: false,
      showAnswer: false,
      timerStartedAt: null,
      timerDuration: 0,
    });
    setGameStarted(false);
    navigate('/dashboard');
  };

  const handleButtonPress = (buttonName) => {
    setIsButtonPressed(buttonName);
    setTimeout(() => setIsButtonPressed(''), 200);
  };

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Determine if we should use mobile or desktop grid based on window width
  const useGridStyle = window.innerWidth >= 640 ? styles.gridMd : styles.grid;

  return (
    <div style={styles.pageContainer}>
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
            .title {
              font-size: 1.5rem !important;
            }
            .card {
              padding: 1rem !important;
            }
            .button {
              padding: 0.75rem 1rem !important;
              font-size: 0.875rem !important;
            }
            .select, .input {
              font-size: 16px !important; /* Prevent zoom on mobile */
            }
          }

          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        `}
      </style>

      <div style={styles.contentContainer} className="card">
        <div style={styles.headerContainer}>
          <BackButton to="/dashboard" />
          <h1 style={styles.title} className="title">
            Manage Play Along
          </h1>
        </div>

        {success && <div style={styles.successAlert}>{success}</div>}

        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.cardContainer}>
          <div
            style={styles.card}
            className="card"
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <h2 style={styles.cardSubtitle}>Select Question Bank</h2>
            <select
              value={selectedBank?._id || ''}
              onChange={(e) => handleBankSelect(e.target.value)}
              style={styles.select}
              className="select"
              onFocus={(e) => Object.assign(e.target.style, styles.selectFocus)}
              onBlur={(e) => {
                e.target.style.outline = '';
                e.target.style.borderColor = 'rgba(28, 63, 170, 0.5)';
                e.target.style.boxShadow = '';
                e.target.style.background = 'rgba(0, 11, 62, 0.6)';
              }}
            >
              <option value="">Select a question bank</option>
              {questionBanks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name}
                </option>
              ))}
            </select>

            {selectedBank && (
              <div style={{ marginTop: '1.5rem' }}>
                {!gameStarted ? (
                  <button
                    onClick={() => {
                      handleButtonPress('start');
                      startGame();
                    }}
                    style={{
                      ...styles.button,
                      ...(isButtonPressed === 'start' ? styles.pressedButton : {}),
                      animation: 'pulse 2s infinite',
                    }}
                    className="button"
                    onMouseOver={(e) => {
                      if (!isButtonPressed) Object.assign(e.currentTarget.style, styles.buttonHover);
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
                      e.currentTarget.style.transform = isButtonPressed === 'start' ? 'scale(0.95)' : '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    Start Game
                  </button>
                ) : (
                  <>
                    <div style={styles.questionCard}>
                      <h3 style={styles.questionLabel}>Current Question:</h3>
                      <p style={styles.questionText}>
                        {selectedBank.questions[currentQuestionIndex].question}
                      </p>
                    </div>

                    <div style={useGridStyle}>
                      <div style={styles.timerCard}>
                        <label style={styles.timerLabel}>Timer Duration (seconds)</label>
                        <div style={styles.timerInputContainer}>
                          <input
                            type="number"
                            min="5"
                            max="60"
                            value={timerDuration}
                            onChange={(e) => setTimerDuration(e.target.value)}
                            style={styles.timerInput}
                            className="input"
                            onFocus={(e) => Object.assign(e.currentTarget.style, styles.timerInputFocus)}
                            onBlur={(e) => {
                              e.currentTarget.style.outline = '';
                              e.currentTarget.style.borderColor = 'rgba(28, 63, 170, 0.5)';
                              e.currentTarget.style.boxShadow = '';
                              e.currentTarget.style.background = 'rgba(0, 11, 62, 0.6)';
                            }}
                          />
                          <span style={styles.timerUnit}>sec</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleButtonPress('options');
                          showOptions();
                        }}
                        style={{
                          ...styles.button,
                          ...(isButtonPressed === 'options' ? styles.pressedButton : {}),
                        }}
                        className="button"
                        onMouseOver={(e) => {
                          if (!isButtonPressed) Object.assign(e.currentTarget.style, styles.buttonHover);
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
                          e.currentTarget.style.transform = isButtonPressed === 'options' ? 'scale(0.95)' : '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        Show Options
                      </button>
                    </div>

                    <div style={useGridStyle}>
                      <button
                        onClick={() => {
                          handleButtonPress('answer');
                          showAnswer();
                        }}
                        style={{
                          ...styles.button,
                          ...(isButtonPressed === 'answer' ? styles.pressedButton : {}),
                        }}
                        className="button"
                        onMouseOver={(e) => {
                          if (!isButtonPressed) Object.assign(e.currentTarget.style, styles.buttonHover);
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
                          e.currentTarget.style.transform = isButtonPressed === 'answer' ? 'scale(0.95)' : '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        Show Answer
                      </button>
                    </div>

                    <div style={useGridStyle}>
                      <button
                        onClick={() => {
                          handleButtonPress('next');
                          showNextQuestion();
                        }}
                        disabled={currentQuestionIndex === selectedBank.questions.length - 1}
                        style={{
                          ...styles.button,
                          ...(currentQuestionIndex === selectedBank.questions.length - 1
                            ? styles.disabledButton
                            : {}),
                        }}
                        className="button"
                        onMouseOver={(e) => {
                          if (!isButtonPressed) Object.assign(e.currentTarget.style, styles.buttonHover);
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
                          e.currentTarget.style.transform = isButtonPressed === 'next' ? 'scale(0.95)' : '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        Next Question
                      </button>
                      <button
                        onClick={() => {
                          handleButtonPress('stop');
                          stopGame();
                        }}
                        style={{
                          ...styles.button,
                          ...styles.redButton,
                          ...(isButtonPressed === 'stop' ? styles.pressedButton : {}),
                        }}
                        className="button"
                        onMouseOver={(e) => {
                          if (!isButtonPressed) Object.assign(e.currentTarget.style, styles.redButtonHover);
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${colors.red}, ${colors.darkRed})`;
                          e.currentTarget.style.transform = isButtonPressed === 'stop' ? 'scale(0.95)' : '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        Stop Game
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePlayAlong;