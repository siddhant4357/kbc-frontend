import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';
import { useFirebaseGameState } from '../hooks/useFirebaseGameState';
import { ref, set } from 'firebase/database';
import { db } from '../utils/firebase'; // Changed from '../utils/firebaseConfig

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
      message: 'Connection test'
    }).then(() => {
      console.log('Firebase connection successful');
    }).catch(error => {
      console.error('Firebase connection failed:', error);
      setError('Failed to connect to Firebase');
    });
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionbanks`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setQuestionBanks(data);
    } catch (error) {
      console.error('Error fetching question banks:', error);
    }
  };

  const handleBankSelect = async (bankId) => {
    const bank = questionBanks.find(b => b._id === bankId);
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
          questionIndex: 0
        },
        showOptions: false,
        showAnswer: false,
        timerStartedAt: null,
        timerDuration: parseInt(timerDuration),
        players: {},
        startedAt: Date.now()
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
          questionIndex: nextIndex
        },
        showOptions: false,
        showAnswer: false,
        timerStartedAt: null
      });
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const showOptions = async () => {
    if (gameStarted) {
      await updateGameState({
        showOptions: true,
        timerStartedAt: Date.now(),
        timerDuration: parseInt(timerDuration)
      });
    }
  };

  const showAnswer = async () => {
    if (gameStarted) {
      await updateGameState({
        showAnswer: true
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
      timerDuration: 0
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

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex items-center space-x-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-4xl kbc-title">Manage Play Along</h1>
        </div>

        {success && (
          <div className="bg-green-500 bg-opacity-20 text-green-100 p-4 rounded-lg mb-6 animate-fadeIn">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div className="kbc-card hover-card">
            <h2 className="text-xl font-bold text-kbc-gold mb-4">Select Question Bank</h2>
            <select
              value={selectedBank?._id || ''}
              onChange={(e) => handleBankSelect(e.target.value)}
              className="kbc-select"
            >
              <option value="">Select a question bank</option>
              {questionBanks.map(bank => (
                <option key={bank._id} value={bank._id}>
                  {bank.name}
                </option>
              ))}
            </select>

            {selectedBank && (
              <div className="space-y-6">
                {!gameStarted ? (
                  <button
                    onClick={() => {
                      handleButtonPress('start');
                      startGame();
                    }}
                    className={`kbc-button1 w-full animate-pulse ${
                      isButtonPressed === 'start' ? 'transform scale-95' : ''
                    }`}
                  >
                    Start Game
                  </button>
                ) : (
                  <>
                    <div className="kbc-card bg-opacity-20 p-4 rounded-lg">
                      <h3 className="text-kbc-gold font-medium mb-2">Current Question:</h3>
                      <p className="text-white">{selectedBank.questions[currentQuestionIndex].question}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="kbc-card">
                        <label className="block text-kbc-gold text-sm mb-2">
                          Timer Duration (seconds)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={timerDuration}
                          onChange={(e) => setTimerDuration(e.target.value)}
                          className="kbc-input"
                        />
                      </div>
                      <button
                        onClick={() => {
                          handleButtonPress('options');
                          showOptions();
                        }}
                        className={`kbc-button1 ${
                          isButtonPressed === 'options' ? 'transform scale-95' : ''
                        }`}
                      >
                        Show Options
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          handleButtonPress('answer');
                          showAnswer();
                        }}
                        className={`kbc-button1 ${
                          isButtonPressed === 'answer' ? 'transform scale-95' : ''
                        }`}
                      >
                        Show Answer
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          handleButtonPress('next');
                          showNextQuestion();
                        }}
                        disabled={currentQuestionIndex === selectedBank.questions.length - 1}
                        className={`kbc-button1 ${
                          currentQuestionIndex === selectedBank.questions.length - 1 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                        } ${isButtonPressed === 'next' ? 'transform scale-95' : ''}`}
                      >
                        Next Question
                      </button>
                      <button
                        onClick={() => {
                          handleButtonPress('stop');
                          stopGame();
                        }}
                        className={`kbc-button1 bg-red-600 hover:bg-red-700 ${
                          isButtonPressed === 'stop' ? 'transform scale-95' : ''
                        }`}
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