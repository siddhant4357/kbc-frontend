import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../utils/config';
import defaultQuestionImage from '../assets/default_img.jpg';
import { useFirebaseGameState } from '../hooks/useFirebaseGameState';
import { ref, set } from 'firebase/database';
import { db } from '../utils/firebase';
import kbcLogo from '../assets/kbc-logo.jpg';

const getImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === '') return defaultQuestionImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('data:')) return imageUrl;
  
  try {
    // For relative paths from backend, ensure consistent formatting
    if (imageUrl.includes('uploads/questions/')) {
      return `${API_URL}/${imageUrl.replace(/^\//, '')}`;
    }
    
    // Extract filename and construct proper URL
    const filename = imageUrl.split('/').pop();
    return `${API_URL}/uploads/questions/${filename}`;
  } catch (error) {
    console.warn('Error formatting image URL:', error);
    return defaultQuestionImage;
  }
};

const ImageErrorBoundary = React.memo(({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => setHasError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-kbc-dark-blue/50 rounded-lg">
        <div className="text-center">
          <div className="text-kbc-gold text-sm mb-2">Unable to load image</div>
          <img 
            src={defaultQuestionImage}
            alt="Default"
            className="w-24 h-24 mx-auto opacity-50"
          />
        </div>
      </div>
    );
  }

  return children;
});

const QuestionImage = React.memo(({ imageUrl }) => {
  const [imgSrc, setImgSrc] = useState(() => getImageUrl(imageUrl));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset states when imageUrl changes
    setImgSrc(getImageUrl(imageUrl));
    setHasError(false);
    setIsLoading(true);
  }, [imageUrl]);

  const handleError = () => {
    console.warn('Error loading image:', imgSrc);
    if (imgSrc !== defaultQuestionImage) {
      setImgSrc(defaultQuestionImage);
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-kbc-dark-blue/50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-kbc-gold"></div>
        </div>
      )}
      <img
        src={imgSrc}
        alt="Question"
        className={`w-full h-full object-contain rounded-lg shadow-glow transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
        crossOrigin="anonymous"
      />
    </div>
  );
});

const PlayGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // State management - group related states together
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lockedAnswer, setLockedAnswer] = useState(null);
  const [gameStopped, setGameStopped] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [gameToken, setGameToken] = useState(() => localStorage.getItem(`game_${id}_token`));
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerDuration, setTimerDuration] = useState(15);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);

  // Firebase game state
  const { gameState: firebaseGameState } = useFirebaseGameState(id);

  const processGameState = useCallback(async (state) => {
    if (!state) return;

    // Check if game is stopped or inactive
    if (!state.isActive) {
      setGameStopped(true);
      setCurrentQuestion(null);
      setShowOptions(false);
      setShowAnswer(false);
      setSelectedOption(null);
      setLockedAnswer(null);
      
      setError('Game has been stopped by the admin');
      setTimeout(() => {
        localStorage.removeItem(`game_${id}_token`);
        navigate('/dashboard');
      }, 2000);
      return;
    }

    // Process game token
    if (state.gameToken && state.gameToken !== gameToken) {
      setGameToken(state.gameToken);
      localStorage.setItem(`game_${id}_token`, state.gameToken);
    }

    // Handle game stopped state
    if (state.gameStopped && !gameStopped) {
      setGameStopped(true);
      setCurrentQuestion(null);
      setShowOptions(false);
      setShowAnswer(false);
      setSelectedOption(null);
      setLockedAnswer(null);
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    setIsWaiting(false);

    // Handle question changes
    const newQuestionIndex = parseInt(state.currentQuestion?.questionIndex ?? 0);
    const currentQuestionIndex = parseInt(currentQuestion?.questionIndex ?? -1);
    
    if (state.currentQuestion && newQuestionIndex !== currentQuestionIndex) {
      setCurrentQuestion({
        ...state.currentQuestion,
        questionIndex: newQuestionIndex
      });
      setShowOptions(false);
      setShowAnswer(false);
      setSelectedOption(null);
      setLockedAnswer(null);
      setGameStopped(false);
    }

    // Handle options state
    if (state.showOptions !== showOptions) {
      setTimerStartedAt(state.timerStartedAt);
      setTimerDuration(state.timerDuration || 15);
      setIsTimerExpired(false);
      setShowOptions(state.showOptions);
    }

    // Handle answer reveal
    if (state.showAnswer && !showAnswer) {
      setShowAnswer(true);
    }
  }, [id, gameToken, currentQuestion, showOptions, showAnswer, gameStopped, navigate]);

  const formatTime = (seconds) => {
    if (seconds < 0) return '00';
    return seconds.toString().padStart(2, '0');
  };

  // Update the timer effect
  useEffect(() => {
    let interval;
    if (timerStartedAt && showOptions && !isTimerExpired) {
      interval = setInterval(() => {
        const now = new Date();
        const startTime = new Date(timerStartedAt);
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remainingSeconds = timerDuration - elapsedSeconds;

        if (remainingSeconds <= 0) {
          setTimeLeft(0);
          setIsTimerExpired(true);
          if (!lockedAnswer) {
            setSelectedOption(null);
          }
          clearInterval(interval);
        } else {
          setTimeLeft(remainingSeconds);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerStartedAt, timerDuration, showOptions, lockedAnswer, isTimerExpired]);

  useEffect(() => {
    if (firebaseGameState && user) {
      processGameState(firebaseGameState).catch(console.error);
    }
  }, [firebaseGameState, user, processGameState]);

  const handleOptionSelect = (option) => {
    if (!showAnswer && !lockedAnswer) {
      setSelectedOption(option);
    }
  };

  const handleLockAnswer = async () => {
    if (!selectedOption || lockedAnswer || showAnswer || timeLeft <= 0) return;

    try {
      const userRef = ref(db, `games/${id}/players/${user.username}/answers/${currentQuestion.questionIndex}`);
      const answerData = {
        answer: selectedOption,
        answeredAt: Date.now(),
        isCorrect: selectedOption === currentQuestion.correctAnswer
      };

      // Update Firebase
      await set(userRef, answerData);
      setLockedAnswer(selectedOption);

      // Update user points in MongoDB
      if (selectedOption === currentQuestion.correctAnswer) {
        await fetch(`${API_URL}/api/leaderboard/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username: user.username,
            points: 10,
            isCorrect: true
          })
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer');
    }
  };

  const handleExitGame = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = async () => {
    try {
      // Update Firebase to mark player as offline
      if (user) {
        const userRef = ref(db, `games/${id}/players/${user.username}`);
        await set(userRef, {
          ...firebaseGameState?.players?.[user.username],
          isOnline: false,
          leftAt: Date.now()
        });
      }
    } catch (err) {
      console.error('Error updating player status:', err);
    }

    localStorage.removeItem(`game_${id}_token`);
    navigate('/dashboard');
  };

  if (isWaiting) {
    return (
      <div className="game-container overflow-hidden">
        <style>
          {`
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 15px rgba(255, 184, 0, 0.3); }
              50% { box-shadow: 0 0 30px rgba(255, 184, 0, 0.5); }
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }

            @keyframes ripple {
              0% { transform: scale(0.8); opacity: 1; }
              100% { transform: scale(2); opacity: 0; }
            }
          `}
        </style>

        <header className="game-header">
          <div className="header-content">
            <button
              onClick={handleExitGame}
              className="kbc-button bg-red-600 hover:bg-red-700 w-14 h-8 text-xs"
              style={{
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 184, 0, 0.3)'
              }}
            >
              QUIT
            </button>
            <img
              src={kbcLogo}
              alt="KBC Logo"
              className="h-8"
              style={{ filter: 'drop-shadow(0 0 8px rgba(255, 184, 0, 0.3))' }}
            />
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
          <div 
            className="relative max-w-lg w-full mx-auto text-center p-8 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(11, 29, 120, 0.95), rgba(28, 63, 170, 0.95))',
              border: '2px solid rgba(255, 184, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              animation: 'glow 2s infinite',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 -z-10">
              <div 
                className="absolute inset-0 rounded-xl"
                style={{
                  animation: 'ripple 2s linear infinite',
                  border: '2px solid rgba(255, 184, 0, 0.2)'
                }}
              />
              <div 
                className="absolute inset-0 rounded-xl"
                style={{
                  animation: 'ripple 2s linear infinite 0.5s',
                  border: '2px solid rgba(255, 184, 0, 0.2)'
                }}
              />
            </div>

            <img
              src={kbcLogo}
              alt="KBC Logo"
              className="w-24 h-24 mx-auto mb-6 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255, 184, 0, 0.4))' }}
            />

            {/* Loading spinner */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  border: '3px solid transparent',
                  borderTopColor: '#FFB800',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <div 
                className="absolute inset-2 rounded-full"
                style={{
                  border: '3px solid transparent',
                  borderTopColor: '#1C3FAA',
                  animation: 'spin 1.5s linear infinite reverse'
                }}
              />
            </div>

            <h2 
              className="text-2xl font-bold mb-4"
              style={{
                color: '#FFB800',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Waiting for Host to Start
            </h2>
            
            <p className="text-gray-300 mb-6">
              Get ready for an exciting game of KBC!
            </p>

            <div 
              className="text-sm text-gray-400"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 11, 62, 0.5), rgba(28, 63, 170, 0.5))',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              Please stay on this screen. The game will begin automatically.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container overflow-hidden">
      <header className="game-header">
        <div className="header-content">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExitGame}
                className="kbc-button bg-red-600 hover:bg-red-700 text-xs h-8 w-14"
              >
                QUIT
              </button>
              <div className="hidden sm:block">
                <p className="text-kbc-gold text-xs">Player</p>
                <p className="text-white font-bold text-sm">
                  {JSON.parse(localStorage.getItem('user'))?.username}
                </p>
              </div>
            </div>

            <div className="flex justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="rgba(255, 184, 0, 0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="var(--kbc-gold)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${(1 - timeLeft / timerDuration) * 2 * Math.PI * 45}`}
                    style={{
                      transition: 'stroke-dashoffset 1s linear'
                    }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold text-kbc-gold">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto pt-16 sm:pt-20 px-2 sm:px-4 flex flex-col lg:flex-row min-h-screen">
        {/* Main game content */}
        <div className="flex-1 flex flex-col order-2 lg:order-1 pb-4">
          {currentQuestion && (
            <>
              <div className="question-image mb-4 flex justify-center transition-all duration-300">
                <div className={`relative w-full max-w-xl ${
                  showOptions || (selectedOption && !lockedAnswer) 
                    ? 'h-32 sm:h-40 lg:h-66'
                    : 'h-48 sm:h-64 lg:h-88'
                }`}>
                  <ImageErrorBoundary>
                    <QuestionImage imageUrl={currentQuestion.imageUrl} />
                  </ImageErrorBoundary>
                </div>
              </div>

              <div className="kbc-question-box p-4 sm:p-6 shadow-glow mb-4 max-w-3xl mx-auto w-full">
                <h2 className="text-xl text-kbc-gold mb-3">
                  Question {(parseInt(currentQuestion.questionIndex ?? 0) + 1)}
                </h2>
                <p className="text-white text-lg mb-3">{currentQuestion.question}</p>
              </div>
            </>
          )}

          {/* Options grid */}
          {showOptions && currentQuestion && (
            <div className="options-grid max-w-3xl mx-auto w-full mb-8 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`kbc-option ${
                      selectedOption === option ? 'selected' : ''
                    } ${
                      showAnswer && option === currentQuestion.correctAnswer ? 'correct' : ''
                    } ${
                      showAnswer && selectedOption === option && 
                      option !== currentQuestion.correctAnswer ? 'incorrect' : ''
                    }`}
                    disabled={lockedAnswer || showAnswer || timeLeft === 0}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lock answer button */}
          {selectedOption && !lockedAnswer && !showAnswer && timeLeft > 0 && (
            <div className="text-center max-w-3xl mx-auto w-full mb-8">
              <button
                onClick={handleLockAnswer}
                className="kbc-button1 pulse-animation shadow-glow"
              >
                Lock Final Answer ({formatTime(timeLeft)}s)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile prize display */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-kbc-dark-blue/90 backdrop-blur-sm p-2">
        <div className="text-center">
          <span className="text-kbc-gold">Made with ❤️ by Sid</span>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="kbc-card w-full max-w-md p-4 sm:p-6">
            <h2 className="text-xl font-bold text-kbc-gold mb-4">Confirm Exit</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to quit the game?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="kbc-button1 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="kbc-button1 bg-red-600 hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default PlayGame;