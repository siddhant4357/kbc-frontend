import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../utils/firebase';

export const useOptimizedGameState = (gameId) => {
  const [gameBasics, setGameBasics] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameOptions, setGameOptions] = useState({ showOptions: false, showAnswer: false });
  const [timerInfo, setTimerInfo] = useState({ timerStartedAt: null, timerDuration: 30 });
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const listeners = useRef([]);
  
  // Add cache mechanism
  const questionCache = useRef({});
  const stateCache = useRef({});

  useEffect(() => {
    if (!gameId) return;
    
    // Listen for basic game state (small payload)
    const gameBasicsRef = ref(db, `games/${gameId}/isActive`);
    const gameTokenRef = ref(db, `games/${gameId}/gameToken`);
    const gameStoppedRef = ref(db, `games/${gameId}/gameStopped`);
    
    // Listen for question data
    const questionRef = ref(db, `games/${gameId}/currentQuestion`);
    
    // Listen for options/answer state
    const optionsRef = ref(db, `games/${gameId}/showOptions`);
    const answerRef = ref(db, `games/${gameId}/showAnswer`);
    
    // Listen for timer data
    const timerStartRef = ref(db, `games/${gameId}/timerStartedAt`);
    const timerDurationRef = ref(db, `games/${gameId}/timerDuration`);
    
    // Connection status
    const connectedRef = ref(db, '.info/connected');
    
    // Set up listeners
    const basicsListener = onValue(gameBasicsRef, (snap) => {
      setGameBasics(prev => ({ ...prev, isActive: snap.val() }));
      setIsInitialized(true);
    });
    
    const tokenListener = onValue(gameTokenRef, (snap) => {
      setGameBasics(prev => ({ ...prev, gameToken: snap.val() }));
    });
    
    const stoppedListener = onValue(gameStoppedRef, (snap) => {
      setGameBasics(prev => ({ ...prev, gameStopped: snap.val() }));
    });
    
    const questionListener = onValue(questionRef, (snap) => {
      const newQuestion = snap.val();
      // Cache the question data
      if (newQuestion && typeof newQuestion.questionIndex === 'number') {
        questionCache.current[newQuestion.questionIndex] = newQuestion;
      }
      setCurrentQuestion(newQuestion);
    });
    
    const optionsListener = onValue(optionsRef, (snap) => {
      setGameOptions(prev => ({ ...prev, showOptions: snap.val() }));
    });
    
    const answerListener = onValue(answerRef, (snap) => {
      setGameOptions(prev => ({ ...prev, showAnswer: snap.val() }));
    });
    
    const timerStartListener = onValue(timerStartRef, (snap) => {
      setTimerInfo(prev => ({ ...prev, timerStartedAt: snap.val() }));
    });
    
    const timerDurationListener = onValue(timerDurationRef, (snap) => {
      setTimerInfo(prev => ({ ...prev, timerDuration: snap.val() }));
    });
    
    const connectedListener = onValue(connectedRef, (snap) => {
      setIsConnected(snap.val() === true);
      if (snap.val() !== true) {
        setError('Disconnected from server');
      } else {
        setError(null);
      }
    });
    
    // Track all listeners for cleanup
    listeners.current = [
      { ref: gameBasicsRef, listener: basicsListener },
      { ref: gameTokenRef, listener: tokenListener },
      { ref: gameStoppedRef, listener: stoppedListener },
      { ref: questionRef, listener: questionListener },
      { ref: optionsRef, listener: optionsListener },
      { ref: answerRef, listener: answerListener },
      { ref: timerStartRef, listener: timerStartListener },
      { ref: timerDurationRef, listener: timerDurationListener },
      { ref: connectedRef, listener: connectedListener }
    ];
    
    return () => {
      listeners.current.forEach(({ ref, listener }) => {
        off(ref, listener);
      });
    };
  }, [gameId]);
  
  // Compose complete game state from fragments for compatibility
  const gameState = {
    ...gameBasics,
    ...gameOptions,
    currentQuestion,
    ...timerInfo
  };
  
  // Add a function to get from cache
  const getCachedQuestion = (questionIndex) => {
    return questionCache.current[questionIndex] || null;
  };
  
  return { gameState, currentQuestion, gameOptions, timerInfo, isConnected, error, isInitialized, getCachedQuestion };
};