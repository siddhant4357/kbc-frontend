import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';
import questionTune from '../assets/question_tune.wav';
import timerSound from '../assets/kbc_time.mp3';
import timerEndSound from '../assets/kbc_timer_finish.mp4';
import correctAnswerSound from '../assets/kbc_correct_ans.wav';
import wrongAnswerSound from '../assets/kbc_wrong_ans.wav';
import defaultQuestionImage from '../assets/default_img.jpg';
import '../styles/JoinQuestions.css';

const PRIZE_LEVELS = [
  "1. सवाल",
  "2. सवाल",
  "3. सम्यक दर्शन",
  "4. सवाल",
  "5. सवाल",
  "6. सम्यक ज्ञान",
  "7. सवाल",
  "8. सवाल",
  "9. सवाल",
  "10.सम्यक चारित्र-ज्ञानवान",
];

const RestartSoundButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 right-4 kbc-button w-12 h-12 flex items-center justify-center text-xl rounded-full shadow-glow z-50"
    title="Restart Sound"
  >
    🔄
  </button>
);

const scrollToFeedback = () => {
  const feedbackElement = document.getElementById('feedback-section');
  if (feedbackElement) {
    feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const JoinQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionBank, setQuestionBank] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const savedIndex = localStorage.getItem(`questionIndex_${id}`);
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerDuration, setTimerDuration] = useState(15);
  const [timerStarted, setTimerStarted] = useState(false);
  const [lockedAnswer, setLockedAnswer] = useState(null);
  const [showGameEndPopup, setShowGameEndPopup] = useState(false);
  const [gameEndMessage, setGameEndMessage] = useState('');
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    askAudience: true
  });
  const [customTimerInput, setCustomTimerInput] = useState(15);
  const [timeExpired, setTimeExpired] = useState(false);
  const [continuePlaying, setContinuePlaying] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [isTimerStopped, setIsTimerStopped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isSoundPaused, setIsSoundPaused] = useState(false);
  const [isInfiniteTimer, setIsInfiniteTimer] = useState(false);

  const [audioElements, setAudioElements] = useState(() => ({
    timer: new Audio(timerSound),
    question: new Audio(questionTune),
    timerEnd: new Audio(timerEndSound),
    correct: new Audio(correctAnswerSound),
    wrong: new Audio(wrongAnswerSound)
  }));

  useEffect(() => {
    Object.values(audioElements).forEach(audio => {
      audio.volume = 0.5;
      audio.preload = 'auto';
    });

    return () => {
      stopAllSounds();
      Object.values(audioElements).forEach(audio => {
        audio.src = '';
        audio.load();
      });
    };
  }, [audioElements]);

  const updateVolume = (newVolume) => {
    Object.values(audioElements).forEach(audio => {
      audio.volume = newVolume;
    });
  };

  const playSound = async (key, options = {}) => {
    try {
      const audio = audioElements[key];
      if (!audio) return;

      // Reset the audio source if it was cleared
      switch (key) {
        case 'timer':
          audio.src = timerSound;
          break;
        case 'question':
          audio.src = questionTune;
          break;
        case 'timerEnd':
          audio.src = timerEndSound;
          break;
        case 'correct':
          audio.src = correctAnswerSound;
          break;
        case 'wrong':
          audio.src = wrongAnswerSound;
          break;
      }

      if (options.stopOthers) {
        await stopAllSounds();
      }

      audio.currentTime = 0;
      audio.loop = !!options.loop;

      try {
        await audio.load(); // Ensure audio is loaded before playing
        await audio.play();
      } catch (error) {
        console.error(`Error playing ${key}:`, error);
      }
    } catch (error) {
      console.error(`Error in playSound ${key}:`, error);
    }
  };

  const stopSound = async (key) => {
    try {
      const audio = audioElements[key];
      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    } catch (error) {
      console.error(`Error stopping ${key}:`, error);
    }
  };

  const stopAllSounds = async () => {
    Object.values(audioElements).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
      }
    });
  };

  useEffect(() => {
    const fetchQuestionBank = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questionbanks/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch question bank');
        }

        const data = await response.json();
        setQuestionBank(data);
        if (data?.questions?.length > 0) {
          setCurrentQuestion(data.questions[currentQuestionIndex]);
        }
      } catch (error) {
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionBank();
  }, [id, currentQuestionIndex]);

  useEffect(() => {
    let timer;
    if (timerStarted && timeLeft > 0 && !isTimerStopped && !isInfiniteTimer) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !lockedAnswer && !isTimerStopped && !isInfiniteTimer) {
      const handleTimerEnd = async () => {
        await stopAllSounds();
        await playSound('timerEnd');
        setTimeExpired(true);
        setTimerStarted(false);
        setShowAnswer(true);
      };
      handleTimerEnd();
    }

    return () => clearInterval(timer);
  }, [timerStarted, timeLeft, lockedAnswer, isTimerStopped, isInfiniteTimer]);

  useEffect(() => {
    let timer;
    if (showGameEndPopup && redirectTimer > 0) {
      timer = setInterval(() => {
        setRedirectTimer(prev => prev - 1);
      }, 1000);
    } else if (redirectTimer === 0) {
      stopAllSounds();
      localStorage.removeItem(`questionIndex_${id}`);
      navigate('/dashboard');
    }
    return () => {
      clearInterval(timer);
      stopAllSounds();
    };
  }, [showGameEndPopup, redirectTimer, navigate, id]);

  useEffect(() => {
    if (currentQuestion && !showOptions && !showAnswer && !lockedAnswer) {
      const playQuestionSound = async () => {
        await stopAllSounds();
        await playSound('question');
      };
      playQuestionSound();
    }

    return () => {
      stopSound('question');
    };
  }, [currentQuestion?.question]);

  useEffect(() => {
    if (questionBank?.questions) {
      setCurrentQuestion(questionBank.questions[currentQuestionIndex]);
    }
  }, [questionBank, currentQuestionIndex]);

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
      stopAllSounds();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`questionIndex_${id}`, currentQuestionIndex);
  }, [currentQuestionIndex, id]);

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  const handleShowOptions = async () => {
    setTimeLeft(customTimerInput);
    setTimerDuration(customTimerInput);
    setShowOptions(true);
    setTimerStarted(true);

    await stopAllSounds();
    await playSound('timer', { loop: true });
  };

  const handleOptionSelect = (option) => {
    if (!showAnswer && !lockedAnswer && timeLeft > 0) {
      setSelectedOption(option);
    }
  };

  const handleLockAnswer = async () => {
    if (selectedOption && !lockedAnswer && !showAnswer && (timeLeft > 0 || isInfiniteTimer)) {
      setLockedAnswer(selectedOption);
      setTimerStarted(false);
      setShowAnswer(true);
      setIsInfiniteTimer(false);

      await stopAllSounds();
      const soundKey = selectedOption === currentQuestion.correctAnswer ? 'correct' : 'wrong';
      await playSound(soundKey);
    }
  };

  const confirmLockAnswer = () => {
    setLockedAnswer(selectedOption);
    setTimerStarted(false);
    setShowAnswer(true);

    if (selectedOption !== currentQuestion.correctAnswer) {
      setGameEndMessage('Better luck next time!');
      setShowGameEndPopup(true);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questionBank.questions.length - 1) {
      await stopAllSounds();

      setCurrentQuestionIndex(prev => prev + 1);
      setShowOptions(false);
      setSelectedOption(null);
      setShowAnswer(false);
      setTimerStarted(false);
      setTimeLeft(timerDuration);
      setLockedAnswer(null);
      setTimeExpired(false);
      setContinuePlaying(false);
      setHiddenOptions([]);
      setIsTimerStopped(false);
    } else if (lockedAnswer === currentQuestion?.correctAnswer) {
      setGameEndMessage('Congratulations! You have successfully completed the game! 🎉');
      setShowGameEndPopup(true);
      playSound('correct');
    }
  };

  const handleLifeline = (lifeline) => {
    setLifelines(prev => ({
      ...prev,
      [lifeline]: false
    }));

    if (lifeline === 'fiftyFifty' && currentQuestion) {
      const incorrectOptions = currentQuestion.options.filter(
        option => option !== currentQuestion.correctAnswer
      );

      const shuffled = [...incorrectOptions].sort(() => 0.5 - Math.random());
      const optionsToHide = shuffled.slice(0, 2);

      setHiddenOptions(optionsToHide);
    }
  };

  const handleContinuePlaying = () => {
    setContinuePlaying(true);
  };

  const handleEndGame = async () => {
    await stopAllSounds();

    const isGameCompleted = currentQuestionIndex === questionBank.questions.length - 1 
      && lockedAnswer === currentQuestion.correctAnswer;

    setGameEndMessage(
      isGameCompleted 
        ? 'Congratulations! You have successfully completed the game! 🎉' 
        : 'Thank you for playing this game!'
    );
    setShowGameEndPopup(true);
  };

  const formatTime = (seconds) => {
    return seconds.toString().padStart(2, '0');
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    setShowQuitConfirm(true);
  };

  const handleQuitGame = async () => {
    await stopAllSounds();
    localStorage.removeItem(`questionIndex_${id}`);
    navigate('/dashboard');
  };

  const handleRestartSound = async () => {
    await stopAllSounds();
    setIsSoundPaused(false);

    if (timerStarted && timeLeft > 0) {
      playSound('timer', { loop: true });
    } else if (currentQuestion && !showOptions) {
      playSound('question');
    }
  };

  const handleInfiniteTimer = () => {
    setIsInfiniteTimer(prev => !prev);
    setIsTimerStopped(prev => !prev);
  };

  if (loading) return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="text-kbc-gold">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded mb-4">
          {error}
        </div>
        <BackButton to="/join-game" />
      </div>
    </div>
  );

  return (
    <div className="game-container overflow-hidden">
      <header className="">
        <div className="fixed top-0 left-0 right-0 bg-kbc-dark-blue/90 backdrop-blur-sm z-10 p-1 h-10 lg:p-1">
          <div className="flex items-center justify-between gap-2 lg:gap-0 w-full">
            <button
              onClick={handleBackClick}
              className="kbc-button bg-red-600 hover:bg-red-700 text-xs h-7 w-12"
            >
              QUIT
            </button>
            <div className="flex items-center gap-2 lg:gap-0">
              { !showOptions ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={customTimerInput}
                    onChange={(e) => setCustomTimerInput(Number(e.target.value))}
                    className="kbc-input w-12 text-xs h-7 py-0 px-1"
                    placeholder="Sec"
                  />
                  <button
                    onClick={handleShowOptions}
                    className="kbc-button1 text-xs h-7 py-0 px-2 min-w-0"
                  >
                    Start
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleInfiniteTimer}
                    className={`kbc-button w-8 h-7 flex items-center justify-center text-xs rounded-full ${isInfiniteTimer ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    title={isInfiniteTimer ? 'Timer is infinite' : 'Click to make timer infinite'}
                  >
                    {isInfiniteTimer ? '∞' : '⏸'}
                  </button>
                  <div className="relative w-8 h-8 lg:w-56 lg:h-56 mx-auto lg:fixed lg:right-8 lg:top-24 lg:-translate-y-full lg:mb-4 lg:z-[100]">
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
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs lg:text-7xl font-bold text-kbc-gold drop-shadow-[0_2px_8px_rgba(255,184,0,0.5)]">
                      {isInfiniteTimer ? '∞' : formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto pt-12 sm:pt-16 px-2 sm:px-4 flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 flex flex-col lg:pr-80 order-2 lg:order-1 pb-4">
          <div className="block lg:hidden mb-4">
            <div className="kbc-question-box lg:hidden p-3 shadow-glow">
              <div className="flex justify-around items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => handleLifeline('fiftyFifty')}
                    disabled={!lifelines.fiftyFifty}
                    className={`kbc-button w-10 h-10 flex items-center justify-center text-xs ${
                      !lifelines.fiftyFifty ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    50:50
                  </button>
                  {!lifelines.fiftyFifty && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-500 text-xl font-bold transform rotate-90">×</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => handleLifeline('askAudience')}
                    disabled={!lifelines.askAudience}
                    className={`kbc-button w-10 h-10 flex items-center justify-center text-xs ${
                      !lifelines.askAudience ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    👥
                  </button>
                  {!lifelines.askAudience && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-500 text-xl font-bold transform rotate-90">×</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {currentQuestion && (
            <>
              <div className="question-image mb-4 flex justify-center transition-all duration-300">
                <div className={`relative w-full max-w-xl ${
                  showOptions || (selectedOption && !lockedAnswer) 
                    ? 'h-32 sm:h-40 lg:h-66'
                    : 'h-48 sm:h-64 lg:h-88'
                }`}>
                  <img
                    src={currentQuestion.imageUrl 
                      ? currentQuestion.imageUrl.startsWith('http') 
                        ? currentQuestion.imageUrl 
                        : `${API_URL}${currentQuestion.imageUrl}`.replace(/([^:]\/)\/+/g, "$1")
                      : defaultQuestionImage}
                    alt="Question"
                    className="w-full h-full object-contain rounded-lg shadow-glow"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      if (e.target.src !== defaultQuestionImage) {
                        console.warn('Error loading image, falling back to default');
                        e.target.src = defaultQuestionImage;
                      } else {
                        e.target.style.display = 'none';
                        console.error('Error loading default image');
                      }
                    }}
                  />
                </div>
              </div>
              <div className="kbc-question-box p-4 sm:p-6 shadow-glow mb-4 max-w-3xl mx-auto w-full z-10">
                <h2 className="text-xl text-kbc-gold mb-3">
                  Question {currentQuestionIndex + 1} 
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
                      showAnswer && lockedAnswer === option && 
                      option !== currentQuestion.correctAnswer ? 'incorrect' : ''
                    } ${
                      hiddenOptions.includes(option) ? 'opacity-0' : ''
                    }`}
                    disabled={lockedAnswer || showAnswer || timeLeft === 0}
                  >
                    <span className="option-letter">
                      {['A', 'B', 'C', 'D'][index]}
                    </span>
                    {option}
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
          {showAnswer && (
            <div id="feedback-section" className="text-center max-w-3xl mx-auto w-full mb-8 space-y-2">
              {lockedAnswer === currentQuestion.correctAnswer ? (
                <>
                  <p className="text-green-400 text-xl">Correct Answer! 🎉</p>
                  {currentQuestionIndex < questionBank.questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="kbc-button1 shadow-glow"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleEndGame}
                      className="kbc-button1 shadow-glow"
                    >
                      End Game
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-red-400 text-xl">
                    {timeExpired ? "Answer not locked before time!" : "Answer is not correct!"} Better luck next time.
                  </p>
                  {currentQuestionIndex === questionBank.questions.length - 1 ? (
                    <button
                      onClick={handleEndGame}
                      className="kbc-button1 bg-red-600 hover:bg-red-700 shadow-glow"
                    >
                      End Game
                    </button>
                  ) : !continuePlaying ? (
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleContinuePlaying}
                        className="kbc-button1 shadow-glow"
                      >
                        Continue Playing
                      </button>
                      <button
                        onClick={handleEndGame}
                        className="kbc-button1 bg-red-600 hover:bg-red-700 shadow-glow"
                      >
                        End Game
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* <p className="text-white mb-4">
                        The correct answer was: {currentQuestion.correctAnswer}
                      </p> */}
                      <button
                        onClick={handleNextQuestion}
                        className="kbc-button1 shadow-glow"
                      >
                        Next Question
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="hidden lg:block w-80 fixed right-8 top-24 order-1 lg:order-2">
          <div className="kbc-question-box p-3 shadow-glow relative prize-ladder">
            <div className="flex justify-around items-center">
              <div className="relative">
                <button
                  onClick={() => handleLifeline('fiftyFifty')}
                  disabled={!lifelines.fiftyFifty}
                  className={`kbc-button w-12 h-12 flex items-center justify-center text-xs ${
                    !lifelines.fiftyFifty ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  50:50
                </button>
                {!lifelines.fiftyFifty && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-3xl font-bold transform rotate-90">×</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => handleLifeline('askAudience')}
                  disabled={!lifelines.askAudience}
                  className={`kbc-button w-12 h-12 flex items-center justify-center text-xs ${
                    !lifelines.askAudience ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  👥
                </button>
                {!lifelines.askAudience && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-3xl font-bold transform rotate-90">×</span>
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-kbc-gold text-base font-bold text-center mb-2">Prize Ladder</h3>
            <div className="space-y-0.5 text-sm">
              {PRIZE_LEVELS.map((prize, index) => (
                <div
                  key={prize}
                  className={`py-1 px-2 rounded-sm transition-all text-center ${
                    index === currentQuestionIndex
                      ? 'bg-kbc-gold text-kbc-dark-blue font-bold shadow-glow'
                      : index < currentQuestionIndex 
                        ? 'text-white bg-kbc-blue/20'
                        : 'text-kbc-gold'
                  }`}
                >
                  {prize}
                </div>
              )).reverse()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Prize Ladder - Show only on small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-kbc-dark-blue/90 backdrop-blur-sm p-2">
        <div className="text-center">
          <span className="text-kbc-gold">Current Prize: </span>
          <span className="text-white font-bold">{PRIZE_LEVELS[currentQuestionIndex]}</span>
        </div>
      </div>

      {/* Game end popup and other modals */}
      {showGameEndPopup && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="kbc-card p-4 sm:p-8 max-w-md w-full mx-auto text-center shadow-glow">
            <h2 className="text-2xl font-bold text-kbc-gold mb-4">
              Game Over
            </h2>
            <p className="text-xl text-white mb-6">
              {gameEndMessage}
            </p>
            <p className="text-gray-400">
              Redirecting to dashboard in {redirectTimer} seconds...
            </p>
          </div>
        </div>
      )}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="kbc-card p-4 sm:p-8 max-w-md w-full mx-auto text-center shadow-glow">
            <h2 className="text-2xl font-bold text-kbc-gold mb-4">
              Confirm Quit
            </h2>
            <p className="text-xl text-white mb-6">
              Are you sure you want to quit the game?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="kbc-button1"
              >
                Cancel
              </button>
              <button
                onClick={handleQuitGame}
                className="kbc-button1 bg-red-600 hover:bg-red-700"
              >
                Quit Game
              </button>
            </div>
          </div>
        </div>
      )}
      {isSoundPaused && (
        <RestartSoundButton onClick={handleRestartSound} />
      )}
    </div>
  );
};

export default JoinQuestions;