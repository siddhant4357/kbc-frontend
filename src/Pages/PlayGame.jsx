import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../utils/firebase';
import { ref, onValue, set } from 'firebase/database';
import themeAudio from '../assets/kbc_theme.wav';
import questionTune from '../assets/question_tune.wav';
import timerSound from '../assets/kbc_time.mp3';
import correctAnswerSound from '../assets/kbc_correct_ans.wav';
import wrongAnswerSound from '../assets/kbc_wrong_ans.wav';
import timerEndSound from '../assets/kbc_timer_finish.mp4';
import defaultQuestionImage from '../assets/default_img.jpg';
import { loadAudio } from '../utils/audioUtils';

// Update prize levels (from lowest to highest)
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
].reverse(); // Reverse to show highest prize first

const PlayGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lockedAnswer, setLockedAnswer] = useState(null);
  const [gameStopped, setGameStopped] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [gameToken, setGameToken] = useState(localStorage.getItem(`game_${id}_token`));
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(PRIZE_LEVELS.length - 1);
  const [showPrizeLadder, setShowPrizeLadder] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerDuration, setTimerDuration] = useState(15);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [error, setError] = useState(null);

  // Add audio states
  const [themeSound] = useState(() => loadAudio(themeAudio));
  const [questionSound] = useState(() => loadAudio(questionTune));
  const [timerAudio] = useState(() => loadAudio(timerSound));
  const [correctAudio] = useState(() => loadAudio(correctAnswerSound));
  const [wrongAudio] = useState(() => loadAudio(wrongAnswerSound));
  const [timerEndAudio] = useState(() => {
    const audio = new Audio(timerEndSound);
    audio.volume = 0.5;
    return audio;
  });

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSoundPaused, setIsSoundPaused] = useState(false);

  // Add audio utility functions
  const stopAllSounds = async () => {
    [themeSound, questionSound, timerAudio, correctAudio, wrongAudio, timerEndAudio].forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  // Handle user interaction for theme music
  const handleStartExperience = async () => {
    try {
      await themeSound.play();
      themeSound.loop = true;
      setHasUserInteracted(true);
    } catch (error) {
      console.error("Error playing theme:", error);
      setHasUserInteracted(true);
    }
  };

  // Add restart sound handler
  const handleRestartSound = async () => {
    if (isWaiting && themeSound) {
      themeSound.pause();
      themeSound.currentTime = 0;
      try {
        await themeSound.play();
        themeSound.loop = true;
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

  useEffect(() => {
    // Timer effect
    if (timerStartedAt && showOptions) {
      const interval = setInterval(() => {
        const now = new Date();
        const startTime = new Date(timerStartedAt);
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remainingSeconds = timerDuration - elapsedSeconds;
        
        setTimeLeft(Math.max(0, remainingSeconds));
        
        if (remainingSeconds <= 0) {
          setIsTimerExpired(true);
          // Only clear selectedOption if it wasn't locked
          if (!lockedAnswer) {
            setSelectedOption(null);  // This will remove the yellow selection
          }
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timerStartedAt, timerDuration, showOptions, lockedAnswer]);

  useEffect(() => {
    if (!id) return;

    const gameRef = ref(db, `games/${id}`);
    const connectedRef = ref(db, '.info/connected');

    // Listen for connection state
    const connectUnsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === false) {
        setError('Lost connection to game server');
      } else {
        setError(null);
      }
    });

    // Listen for game state changes
    const gameUnsubscribe = onValue(gameRef, async (snapshot) => {
      const state = snapshot.val();
      
      if (!state) return;

      if (state.isActive) {
        await stopAllSounds();
        setCurrentQuestion(state.currentQuestion);
        setShowOptions(state.showOptions);
        setShowAnswer(state.showAnswer);
        setGameStopped(false);
        setIsWaiting(false);

        // Handle timer state
        if (state.timerStartedAt && state.timerDuration) {
          setTimerStartedAt(state.timerStartedAt);
          setTimerDuration(state.timerDuration);
        }
      } else {
        await stopAllSounds();
        if (hasUserInteracted) {
          themeSound.play().catch(console.error);
        }
        setCurrentQuestion(null);
        setShowOptions(false);
        setShowAnswer(false);
        setSelectedOption(null);
        setLockedAnswer(null);
        setGameStopped(false);
        setIsWaiting(true);
      }

      // Handle sounds based on state changes
      if (state.showOptions && !showOptions) {
        await stopAllSounds();
        timerAudio.loop = true;
        timerAudio.play().catch(console.error);
      }

      if (state.showAnswer && !showAnswer) {
        await handleAnswerReveal(state);
      }
    });

    return () => {
      connectUnsubscribe();
      gameUnsubscribe();
    };
  }, [id, hasUserInteracted, showOptions, showAnswer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllSounds();
        setIsSoundPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Add this useEffect for preloading sounds
  useEffect(() => {
    const preloadSounds = async () => {
      try {
        await Promise.all([
          correctAudio.load(),
          wrongAudio.load()
        ]);
      } catch (error) {
        console.error("Error preloading sounds:", error);
      }
    };

    preloadSounds();
  }, [correctAudio, wrongAudio]);

  const handleOptionSelect = (option) => {
    // Allow selecting options if answer isn't locked and answer isn't shown
    if (!showAnswer && !lockedAnswer) {
      setSelectedOption(option);
    }
  };

  const handleLockAnswer = async () => {
    if (!selectedOption || showAnswer || timeLeft <= 0) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      const answerData = {
        answer: selectedOption,
        answeredAt: Date.now(),
        isCorrect: selectedOption === currentQuestion.correctAnswer
      };

      await set(ref(db, `games/${id}/players/${user.username}/answers/${currentQuestion.questionIndex}`), answerData);
      await set(ref(db, `games/${id}/players/${user.username}/status`), {
        lastActive: Date.now(),
        currentQuestion: currentQuestion.questionIndex
      });

      setLockedAnswer(selectedOption);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    }
  };

  const handleAnswerReveal = async (state) => {
    try {
      await stopAllSounds();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (currentQuestion && selectedOption) {
        if (selectedOption === currentQuestion.correctAnswer) {
          correctAudio.currentTime = 0;
          await correctAudio.play();
        } else {
          wrongAudio.currentTime = 0;
          await wrongAudio.play();
        }
      }
      
      setShowAnswer(true);
    } catch (error) {
      console.error("Error playing answer sound:", error);
      setShowAnswer(true);
    }
  };

  const handleExitGame = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = async () => {
    // Stop all sounds before disconnecting
    await stopAllSounds();
    localStorage.removeItem(`game_${id}_token`);
    navigate('/dashboard');
  };

  // Add waiting screen before the main game UI
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kbc-dark-blue to-kbc-purple flex items-center justify-center">
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
            {/* Add header with exit button */}
            <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-3 bg-kbc-dark-blue/80 backdrop-blur-[4px] z-10">
              <button 
                onClick={handleExitGame}
                className="kbc-button bg-red-600 hover:bg-red-700 w-10 h-8 text-xs"
              >
                QUIT
              </button>
              <img 
                src="/src/assets/kbc-logo.png" 
                alt="KBC Logo" 
                className="h-8"
              />
            </header>

            <div className="kbc-card p-8 text-center animate-pulse">
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

            {/* Exit Confirmation Modal */}
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
          </>
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
    <div className="min-h-screen bg-gradient-to-b from-kbc-dark-blue to-kbc-purple">
      {/* Header with better responsiveness for mobile */}
      <header className="fixed top-0 left-0 right-0 bg-kbc-dark-blue/90 backdrop-blur-sm z-10 p-2 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          {/* Left section: Quit button and player info */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitGame}
              className="kbc-button bg-red-600 hover:bg-red-700 text-xs h-8 w-14 sm:px-4"
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
          
          {/* Center section: Timer display - with fixed positioning for mobile */}
          <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="relative w-12 h-12 sm:w-16 right-15 sm:h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-kbc-gold"
                  strokeDasharray={`${(timeLeft / timerDuration) * 176} 176`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-base sm:text-xl text-kbc-gold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* Right section: Username for mobile */}
          <div className="block sm:hidden text-right">
            <p className="text-white font-bold text-sm">
              {JSON.parse(localStorage.getItem('user'))?.username}
            </p>
          </div>
        </div>
      </header>

      {/* Main game area - adjusted padding for mobile */}
      <div className="container mx-auto pt-16 sm:pt-24 px-2 sm:px-4 flex flex-col lg:flex-row min-h-screen pb-6">
        {/* Question Box */}
        <div className="flex-1 flex flex-col justify-between min-h-[calc(100vh-8rem)] lg:pr-80 order-2 lg:order-1">
          {/* Mobile Prize Bar - Only visible on mobile/tablet devices, hidden on laptops/desktops */}
          <div className="block lg:hidden flex flex-col space-y-3 mb-4">
            <div className="kbc-question-box lg:hidden p-3 shadow-glow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-kbc-gold">Current Prize</p>
                  <p className="text-lg font-bold text-white">{PRIZE_LEVELS[currentPrizeIndex]}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow" />
          
          {/* Question container with image support */}
          {currentQuestion && (
            <>
              {/* Image container - with dynamic height based on options visibility */}
              <div className="mb-4 flex justify-center transition-all duration-300">
                <div className={`relative w-full max-w-xl ${
                  showOptions || (selectedOption && !lockedAnswer) 
                    ? 'h-32 sm:h-40 lg:h-66' // Smaller height when options are shown
                    : 'h-48 sm:h-64 lg:h-88' // Larger height when only question is shown
                }`}>
                  <img
                    src={currentQuestion.imageUrl 
                      ? `http://localhost:4000${currentQuestion.imageUrl}` 
                      : defaultQuestionImage}
                    alt="Question"
                    className="w-full h-full object-contain rounded-lg shadow-glow"
                    onError={(e) => {
                      // If the user-provided image fails to load, fall back to default
                      if (e.target.src !== defaultQuestionImage) {
                        console.warn('Error loading image, falling back to default');
                        e.target.src = defaultQuestionImage;
                      } else {
                        // If even the default fails, hide the image
                        e.target.style.display = 'none';
                        console.error('Error loading default image');
                      }
                    }}
                  />
                </div>
              </div>

              {/* Question box */}
              <div className="kbc-question-box p-4 sm:p-8 shadow-glow mb-6 max-w-3xl mx-auto w-full animate-fadeIn">
                <h2 className="text-2xl text-kbc-gold mb-6">
                  Question {(parseInt(currentQuestion.questionIndex ?? 0) + 1)} 
                </h2>
                <p className="text-white text-xl">{currentQuestion.question}</p>
              </div>
            </>
          )}

          {/* Options container - now with connector lines */}
          {showOptions && currentQuestion && (
            <div className="max-w-3xl mx-auto w-full mb-8 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`kbc-option shadow-glow position-relative ${
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
                    
                    {/* Show check/cross marks when answer is revealed
                    {showAnswer && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xl">
                        {option === currentQuestion.correctAnswer ? '✓' : 
                         selectedOption === option ? '✗' : ''}
                      </span>
                    )}
                     */}
                    {/* Connector lines */}
                    <div className={`absolute ${index % 2 === 0 ? 'left-0' : 'right-0'} top-1/2 
                      ${index % 2 === 0 ? 'w-[50vw] right-full bg-gradient-to-l' : 'w-[50vw] left-full bg-gradient-to-r'} 
                      h-0.5 from-kbc-gold to-transparent transform 
                      ${index % 2 === 0 ? '-translate-x-4' : 'translate-x-4'}`}>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lock Answer Button */}
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

        {/* Desktop Prize Ladder - Hide on mobile - Styled like JoinQuestions.jsx */}
        <div className="hidden lg:block w-80 ml-6 fixed right-8 top-24 order-1 lg:order-2">
          <div className="kbc-question-box p-3 shadow-glow relative">
            {/* Add connector line from question to prize ladder */}
            <div className="absolute left-0 top-1/2 w-8 h-0.5 bg-gradient-to-l from-kbc-gold to-transparent transform -translate-x-8"></div>
            
            {/* Divider */}
            <hr className="my-2 border-kbc-gold/30" />
            
            {/* Prize Ladder - with updated styling similar to JoinQuestions.jsx */}
            <h3 className="text-kbc-gold text-base font-bold text-center mb-2">Prize Ladder</h3>
            <div className="space-y-0.5 text-sm overflow-y-auto max-h-[calc(100vh-14rem)]">
              {PRIZE_LEVELS.map((prize, index) => (
                <div
                  key={prize}
                  className={`py-1 px-2 rounded-sm transition-all text-center ${
                    index === currentPrizeIndex
                      ? 'bg-kbc-gold text-kbc-dark-blue font-bold shadow-glow'
                      : index < currentPrizeIndex 
                        ? 'text-white bg-kbc-blue/20'
                        : 'text-kbc-gold'
                  }`}
                >
                  {prize}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal - Fixed structure */}
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
    </div>
  );
};

export default PlayGame;