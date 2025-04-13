import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../utils/config';
import defaultQuestionImage from '../assets/default_img.jpg';
import { useFirebaseGameState } from '../hooks/useFirebaseGameState';
import { ref, set, onDisconnect, serverTimestamp, onValue, update } from 'firebase/database';
import { db } from '../utils/firebase';
import kbcLogo from '../assets/kbc-logo.jpg';

import { debounce, throttle } from 'lodash';

const BATCH_INTERVAL = 2000; // 2 seconds
const MAX_RETRIES = 3;
const RECONNECT_DELAY = 2000;

const getImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === '') return defaultQuestionImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('data:')) return imageUrl;
  
  try {
    const cleanUrl = imageUrl.replace(/([^:])\/+/g, '$1/');
    if (cleanUrl.includes('uploads/questions/')) {
      return `${API_URL}/${cleanUrl.split('uploads/questions/')[1]}`;
    }
    return `${API_URL}/uploads/questions/${cleanUrl.split('/').pop()}`;
  } catch (error) {
    console.error('Error formatting image URL:', error);
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
  const retryCount = useRef(0);

  const handleError = (e) => {
    console.error('Image load error for:', imgSrc);
    if (retryCount.current < 3 && imgSrc !== defaultQuestionImage) {
      retryCount.current += 1;
      setTimeout(() => {
        setImgSrc(`${imgSrc}?retry=${retryCount.current}`);
      }, 1000);
    } else {
      e.target.src = defaultQuestionImage;
      setHasError(true);
    }
    setIsLoading(false);
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
        onLoad={() => {
          setIsLoading(false);
          retryCount.current = 0;
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
});

const ExitConfirmDialog = ({ isOpen, onClose, onConfirm, message, isLoading }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="kbc-card w-full max-w-md p-4 sm:p-6">
        <h2 className="text-xl font-bold text-kbc-gold mb-4">Confirm Exit</h2>
        <p className="text-gray-300 mb-6">
          {message || "Are you sure you want to quit the game?"}
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="kbc-button1 w-full sm:w-auto order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="kbc-button1 bg-red-600 hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2 relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Quit</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                </div>
              </>
            ) : (
              'Quit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuitButton = ({ onQuit }) => {
  return (
    <button
      onClick={onQuit}
      className="kbc-button bg-red-600 hover:bg-red-700 text-xs h-8 w-14"
    >
      QUIT
    </button>
  );
};

const ConnectionStatus = ({ status }) => (
  <div className={`fixed top-4 right-4 px-3 py-1 rounded-full ${
    status === 'connected' ? 'bg-green-500' : 'bg-red-500'
  } text-white text-sm flex items-center gap-2`}>
    <div className={`w-2 h-2 rounded-full ${
      status === 'connected' ? 'bg-green-300' : 'bg-red-300'
    } animate-pulse`} />
    {status === 'connected' ? 'Connected' : 'Reconnecting...'}
  </div>
);

const PlayGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lockedAnswer, setLockedAnswer] = useState(null);
  const [gameStopped, setGameStopped] = useState(false);
  const [gameToken, setGameToken] = useState(() => localStorage.getItem(`game_${id}_token`));
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerDuration, setTimerDuration] = useState(15);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const { gameState: firebaseGameState, error: firebaseError, isInitialized, isConnected } = useFirebaseGameState(id);
  const timeoutsRef = useRef([]);
  const isNavigatingRef = useRef(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const pendingUpdatesRef = useRef([]);
  const batchTimeoutRef = useRef(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Clear states when a new question arrives
    if (currentQuestion) {
      setSelectedOption(null);
      setLockedAnswer(null);
    }
  }, [currentQuestion?.questionIndex]);

  useEffect(() => {
    return () => {
        setSelectedOption(null);
        setLockedAnswer(null);
        setShowOptions(false);
        setShowAnswer(false);
        setTimeLeft(15);
        setIsTimerExpired(false);
    };
  }, [currentQuestion?.questionIndex]);

  const processGameState = useCallback(async (state) => {
    if (!state || isNavigatingRef.current || !isInitialized) return;

    // Reset states when new question arrives
    if (state.currentQuestion && 
        (!currentQuestion || state.currentQuestion.questionIndex !== currentQuestion.questionIndex)) {
        setCurrentQuestion(state.currentQuestion);
        setSelectedOption(null);
        setLockedAnswer(null);
        setShowOptions(false);
        setShowAnswer(false);
        setTimeLeft(state.timerDuration || 15);
        setIsTimerExpired(false);
    }

    // Handle options display
    if (state.showOptions && !state.showAnswer) {
        setShowOptions(true);
        setSelectedOption(null);
        setLockedAnswer(null);
        setShowAnswer(false);
        setTimerStartedAt(state.timerStartedAt);
        setTimerDuration(state.timerDuration || 15);
        setTimeLeft(state.timerDuration || 15);
        setIsTimerExpired(false);
    }

    // Handle answer display
    if (state.showAnswer) {
        setShowAnswer(true);
    }
}, [currentQuestion, isInitialized]);

  const debouncedProcessGameState = useCallback(
    debounce((state) => {
      if (!state || isNavigatingRef.current || !isInitialized) return;
      processGameState(state).catch(console.error);
    }, 500),
    [processGameState]
  );

  const throttledProcessGameState = useMemo(() => 
    throttle((state) => {
      if (!state || isNavigatingRef.current || !isInitialized) return;
      processGameState(state).catch(console.error);
    }, 1000), 
    [processGameState, isInitialized]
  );

  const batchedFirebaseUpdate = useCallback(async () => {
    if (pendingUpdatesRef.current.length === 0) return;

    try {
      const gameRef = ref(db, `games/${id}`);
      
      // Properly structure updates to avoid dots in keys
      const updates = {};
      pendingUpdatesRef.current.forEach(updateObj => {
        Object.entries(updateObj).forEach(([path, value]) => {
          // Convert dot notation to proper Firebase path
          const parts = path.split('.');
          const cleanPath = parts.join('/');
          // Remove games/id prefix if present
          const finalPath = cleanPath.replace(`games/${id}/`, '');
          updates[finalPath] = value;
        });
      });

      await update(gameRef, updates);
      pendingUpdatesRef.current = [];

    } catch (error) {
      console.error('Batch update failed:', error);
      setError('Failed to update game state. Please try again.');
    }
  }, [db, id]);

  const formatTime = (seconds) => {
    if (seconds < 0) return '00';
    return seconds.toString().padStart(2, '0');
  };

  useEffect(() => {
    if (!isConnected) {
      setError('Lost connection to game server. Trying to reconnect...');
    } else {
      setError(null);
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected && isWaiting) {
      setError('Lost connection to game server. You may need to rejoin.');
    }
  }, [isConnected, isWaiting]);

  useEffect(() => {
    if (!isConnected && connectionAttempts < MAX_RETRIES) {
      const reconnectTimeout = setTimeout(() => {
        setConnectionAttempts(prev => prev + 1);
        window.location.reload();
      }, RECONNECT_DELAY * Math.pow(2, connectionAttempts));

      return () => clearTimeout(reconnectTimeout);
    }
  }, [isConnected, connectionAttempts]);

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
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      isNavigatingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (firebaseGameState && user && !isNavigatingRef.current && isInitialized) {
      debouncedProcessGameState(firebaseGameState);
    }

    return () => {
      debouncedProcessGameState.cancel();
    };
  }, [firebaseGameState, user, debouncedProcessGameState, isInitialized]);

  useEffect(() => {
    const userRef = user ? ref(db, `games/${id}/players/${user.username}`) : null;
    
    if (userRef) {
      const presenceData = {
        isOnline: true,
        joinedAt: serverTimestamp(),
        lastActive: Date.now()
      };

      set(userRef, presenceData)
        .catch(error => console.error('Presence update failed:', error));

      onDisconnect(userRef)
        .remove()
        .catch(error => console.error('Disconnect handler failed:', error));

      const presenceInterval = setInterval(() => {
        set(ref(db, `games/${id}/players/${user.username}/lastActive`), Date.now())
          .catch(error => console.error('Presence refresh failed:', error));
      }, 30000);

      return () => {
        clearInterval(presenceInterval);
        set(userRef, null).catch(console.error);
        onDisconnect(userRef).cancel().catch(console.error);
      };
    }
  }, [db, id, user]);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log('Connected to Firebase');
      } else {
        console.log('Disconnected from Firebase');
        setError('Lost connection to game server');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    return onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      setIsLoading(false);
    });
  }, [db]);

  useEffect(() => {
    if (firebaseGameState) {
      setShowOptions(firebaseGameState.showOptions || false);
      setShowAnswer(firebaseGameState.showAnswer || false);
      if (firebaseGameState.currentQuestion) {
        setCurrentQuestion(firebaseGameState.currentQuestion);
      }
      if (firebaseGameState.timerStartedAt && firebaseGameState.timerDuration) {
        setTimerStartedAt(firebaseGameState.timerStartedAt);
        setTimerDuration(firebaseGameState.timerDuration);
      }
      setIsWaiting(!firebaseGameState.isActive);
    }
  }, [firebaseGameState]);

  useEffect(() => {
    return () => {
      setSelectedOption(null);
      setLockedAnswer(null);
      setShowOptions(false);
      setShowAnswer(false);
      setTimeLeft(15);
      setIsTimerExpired(false);
      localStorage.removeItem(`game_${id}_token`);
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const gameRef = ref(db, `games/${id}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setGameState(data);
      setCurrentQuestion(data.currentQuestion || null);
      setShowOptions(data.showOptions || false);
      setShowAnswer(data.showAnswer || false);
      
      if (data.timerStartedAt && data.timerDuration) {
        setTimerStartedAt(data.timerStartedAt);
        setTimerDuration(data.timerDuration);
      }
      
      setIsWaiting(!data.isActive);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;

    const playerRef = ref(db, `games/${id}/players/${user.username}`);
    
    // Update player presence
    set(playerRef, {
      isOnline: true,
      joinedAt: serverTimestamp(),
      lastActive: Date.now()
    });

    // Remove player data when disconnected
    onDisconnect(playerRef).remove();

    // Update last active timestamp periodically
    const interval = setInterval(() => {
      update(playerRef, {
        lastActive: Date.now()
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      set(playerRef, null);
    };
  }, [id, user]);

  useEffect(() => {
    const cleanupRefs = [];
    
    // Store all Firebase refs that need cleanup
    if (user && id) {
      const presenceRef = ref(db, `games/${id}/players/${user.username}/presence`);
      const userRef = ref(db, `games/${id}/players/${user.username}`);
      
      cleanupRefs.push({ ref: presenceRef, onDisconnect: true });
      cleanupRefs.push({ ref: userRef });
    }

    return () => {
      // Clean up all references and listeners
      cleanupRefs.forEach(({ ref, onDisconnect }) => {
        if (onDisconnect) {
          onDisconnect(ref).cancel();
        }
        set(ref, null);
      });

      // Clear all intervals and timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      
      // Reset all states
      setSelectedOption(null);
      setLockedAnswer(null);
      setShowOptions(false);
      setShowAnswer(false);
      setTimeLeft(15);
      setIsTimerExpired(false);
      
      // Clear local storage
      localStorage.removeItem(`game_${id}_token`);
    };
  }, [id, user]);

  const handleOptionSelect = (option) => {
    if (!showAnswer && !lockedAnswer && showOptions) {
      setSelectedOption(option);
    }
  };

  const handleLockAnswer = async () => {
    if (!selectedOption || lockedAnswer || !currentQuestion) return;

    try {
      const answerRef = ref(db, `games/${id}/players/${user.username}/answers/${currentQuestion.questionIndex}`);
      await set(answerRef, {
        answer: selectedOption,
        isCorrect: selectedOption === currentQuestion.correctAnswer,
        timestamp: serverTimestamp()
      });
      setLockedAnswer(selectedOption);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer');
    }
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const handleExitConfirm = async () => {
    try {
      setIsExiting(true);
      setShowExitDialog(false);

      // Remove user presence immediately
      if (user) {
        const userRef = ref(db, `games/${id}/players/${user.username}`);
        set(userRef, null).catch(console.error); // Don't await, let it happen in background
      }
      
      // Clear local storage
      localStorage.removeItem(`game_${id}_token`);
      
      // Clear timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      // Navigate immediately
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Exit cleanup failed:', error);
    }
  };

  const retryOperation = async (operation, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };

  const confirmExit = async () => {
    if (isNavigatingRef.current) return;
    
    try {
      isNavigatingRef.current = true;
      
      if (user) {
        await retryOperation(async () => {
          const userRef = ref(db, `games/${id}/players/${user.username}`);
          await onDisconnect(userRef).cancel();
          await set(userRef, null);
        });
      }
      
      localStorage.removeItem(`game_${id}_token`);
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Error during exit:', err);
      isNavigatingRef.current = false;
      setError('Failed to quit game. Please try again.');
    }
  };

  if (!isInitialized) {
    return (
      <div className="game-container overflow-hidden">
        <div className="kbc-card p-8 text-center mt-20 mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-kbc-gold mx-auto mb-4"></div>
          <h2 className="text-xl text-kbc-gold font-bold">
            Connecting to game...
          </h2>
        </div>
      </div>
    );
  }

  if (isWaiting && isInitialized) {
    return (
      <div className="game-container min-h-screen flex flex-col relative bg-gradient-to-b from-kbc-dark-blue to-kbc-purple">
        {/* Quit button with loading state */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setShowExitDialog(true)}
            className="kbc-button1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold shadow-glow transition-all duration-300 ease-in-out min-w-[100px]"
            disabled={isExiting}
          >
            <span>🚪</span>
            {isExiting ? (
              <div className="flex items-center gap-2">
                <span>Quitting</span>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Quit Game</span>
                <span className="sm:hidden">Quit</span>
              </>
            )}
          </button>
        </div>

          {/* Center content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="kbc-card max-w-md w-full p-6 md:p-8 text-center animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={kbcLogo}
                  alt="KBC Logo"
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full relative z-10 border-2 border-kbc-gold"
                />
              </div>
            </div>
            
            <h2 className="text-lg md:text-xl text-kbc-gold font-bold mb-4">
              Waiting for Game to Start
            </h2>
            
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-kbc-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-kbc-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-kbc-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm">
              Please stay on this screen. The game will begin automatically.
            </p>
          </div>
        </div>

        {/* Exit dialog with highest z-index */}
        <ExitConfirmDialog
          isOpen={showExitDialog}
          onClose={() => setShowExitDialog(false)}
          onConfirm={handleExitConfirm}
          message="Are you sure you want to leave the waiting room?"
          isLoading={isExiting}
        />
      </div>
    );
  }

  return (
    <div className="game-container overflow-hidden">
      <header className="game-header">
        <div className="header-content">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <QuitButton onQuit={() => setShowExitDialog(true)} />
              <div className="hidden sm:block">
                <p className="text-kbc-gold text-xs">Player</p>
                <p className="text-white font-bold text-sm">
                  {JSON.parse(localStorage.getItem('user'))?.username}
                </p>
              </div>
            </div>

            <div className="flex justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10"> {/* Reduced from w-10 h-10 sm:w-12 sm:h-12 */}
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
                <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-kbc-gold">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto pt-12 px-2 sm:px-4 flex flex-col lg:flex-row min-h-screen">
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-kbc-dark-blue/90 backdrop-blur-sm p-2">
        <div className="text-center">
          <span className="text-kbc-gold">Made with ❤️ by Sid</span>
        </div>
      </div>

      <ExitConfirmDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExitConfirm}
        message={isWaiting ? 
          "Are you sure you want to leave the waiting room?" : 
          "Are you sure you want to quit the game?"
        }
        isLoading={isExiting}
      />

      {connectionStatus !== 'connected' && <ConnectionStatus status={connectionStatus} />}

      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default PlayGame;