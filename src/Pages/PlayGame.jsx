import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../utils/config';
import defaultQuestionImage from '../assets/default_img.jpg';
import { useAudioManager } from '../hooks/useAudioManager';
import { useFirebaseGameState } from '../hooks/useFirebaseGameState';
import { ref, set } from 'firebase/database';
import { db } from '../utils/firebase';

// Import audio assets
import themeAudio from '../assets/kbc_theme.wav';
import questionTune from '../assets/question_tune.wav';
import timerSound from '../assets/kbc_time.mp3';
import timerEndSound from '../assets/kbc_timer_finish.mp4';
import correctAnswerSound from '../assets/kbc_correct_ans.wav';
import wrongAnswerSound from '../assets/kbc_wrong_ans.wav';

// Define constants outside component
const PRIZE_LEVELS = [
  "₹1,000",
  "₹2,000",
  "₹3,000",
  "₹5,000",
  "₹10,000",
  "₹20,000",
  "₹40,000",
  "₹80,000",
  "₹1,60,000",
  "₹3,20,000",
  "₹6,40,000",
  "₹12,50,000",
  "₹25,00,000",
  "₹50,00,000",
  "₹1,00,00,000"
];

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return defaultQuestionImage;
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Clean the URL path to handle double slashes
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_URL}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
};

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

  // User interaction state
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSoundPaused, setIsSoundPaused] = useState(false);

  // Initialize audio files
  const audioFiles = useMemo(() => ({
    theme: themeAudio,
    question: questionTune,
    timer: timerSound,
    correct: correctAnswerSound,
    wrong: wrongAnswerSound,
    timerEnd: timerEndSound
  }), []);

  // Audio management
  const { play, stop, stopAll } = useAudioManager(audioFiles);

  // Firebase game state
  const { gameState: firebaseGameState } = useFirebaseGameState(id);

  // Update the processGameState function in PlayGame.jsx
  const processGameState = useCallback(async (state) => {
    if (!state) return;

    // Check if game is stopped or inactive
    if (!state.isActive) {
      await stopAll();
      setGameStopped(true);
      setCurrentQuestion(null);
      setShowOptions(false);
      setShowAnswer(false);
      setSelectedOption(null);
      setLockedAnswer(null);
      
      // Show a brief message before redirecting
      setError('Game has been stopped by the admin');
      
      // Redirect after a short delay
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
      await stopAll();
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
      await stopAll();
      play('question').catch(console.error);

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
      if (state.showOptions) {
        await stopAll();
        play('timer', { loop: true }).catch(console.error);
        setTimerStartedAt(state.timerStartedAt);
        setTimerDuration(state.timerDuration || 15);
        setIsTimerExpired(false);
      }
      setShowOptions(state.showOptions);
    }

    // Handle answer reveal
    if (state.showAnswer && !showAnswer) {
      try {
        await stopAll();
        await new Promise(resolve => setTimeout(resolve, 100));

        if (currentQuestion && selectedOption) {
          const soundKey = selectedOption === currentQuestion.correctAnswer ? 'correct' : 'wrong';
          play(soundKey).catch(console.error);
        }
        setShowAnswer(true);
      } catch (error) {
        console.error("Error playing answer sound:", error);
        setShowAnswer(true);
      }
    }
  }, [id, gameToken, currentQuestion, showOptions, showAnswer, gameStopped, isWaiting, hasUserInteracted, navigate, stopAll]);

  const handleStartExperience = async () => {
    try {
      await play('theme');
      setHasUserInteracted(true);
    } catch (error) {
      console.error("Error playing theme:", error);
      setHasUserInteracted(true);
    }
  };

  const handleRestartSound = async () => {
    if (isWaiting) {
      stop('theme');
      try {
        await play('theme', { loop: true });
        setIsSoundPaused(false);
      } catch (error) {
        console.error("Error restarting sound:", error);
      }
    }
  };

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAll();
        setIsSoundPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAll();
    };
  }, [stopAll]);

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
        answeredAt: Date.now()
      };

      await set(userRef, answerData);
      setLockedAnswer(selectedOption);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer');
    }
  };

  const handleExitGame = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = async () => {
    await stopAll();

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
        {!hasUserInteracted ? (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="kbc-card p-8 text-center max-w-md mx-4">
              <h2 className="text-2xl text-kbc-gold mb-4">Welcome to KBC</h2>
              <p className="text-white mb-6">Click the button below to start your experience</p>
              <button
                onClick={handleStartExperience}
                className="kbc-button1 animate-pulse"
              >
                Start Experience
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="game-header">
              <div className="header-content">
                <button
                  onClick={handleExitGame}
                  className="kbc-button bg-red-600 hover:bg-red-700 w-14 h-8 text-xs"
                >
                  QUIT
                </button>
                <img
                  src="/src/assets/kbc-logo.png"
                  alt="KBC Logo"
                  className="h-8"
                />
              </div>
            </header>

            <div className="kbc-card p-8 text-center mt-20 mx-4 animate-pulse">
              <img
                src="/src/assets/kbc-logo.png"
                alt="KBC Logo"
                className="w-24 h-24 mx-auto mb-6"
              />
              <h2 className="text-2xl text-kbc-gold font-bold mb-4">
                Waiting for Admin to Start the Game
              </h2>
              <p className="text-gray-300 mb-6">
                Please stay on this screen. The game will begin automatically.
              </p>
            </div>
          </>
        )}

        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="kbc-card w-full max-w-md p-4 sm:p-6">
              <h2 className="text-xl font-bold text-kbc-gold mb-4">Confirm Exit</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to leave the game?
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
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        )}

        {isSoundPaused && (
          <button
            onClick={handleRestartSound}
            className="fixed bottom-4 right-4 kbc-button w-12 h-12 flex items-center justify-center text-xl rounded-full shadow-glow z-50"
            title="Restart Sound"
          >
            🔄
          </button>
        )}
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
                  <img
                    src={getImageUrl(currentQuestion.imageUrl)}
                    alt="Question"
                    className="w-full h-full object-contain rounded-lg shadow-glow"
                    onError={(e) => {
                      console.warn('Error loading image:', currentQuestion.imageUrl);
                      if (e.target.src !== defaultQuestionImage) {
                        console.log('Falling back to default image');
                        e.target.src = defaultQuestionImage;
                        e.target.onerror = null; // Prevent infinite loop
                      }
                    }}
                    crossOrigin="anonymous"
                  />
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