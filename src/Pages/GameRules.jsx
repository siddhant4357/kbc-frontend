// frontend/src/Pages/GameRules.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import kbcLogo from '../assets/kbc-logo.jpg';
import themeAudio from '../assets/kbc_theme.wav';
import questionTune from '../assets/kbc_option_lock_tune.wav';
import { API_URL } from '../utils/config';

const RestartSoundButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 right-4 kbc-button w-12 h-12 flex items-center justify-center text-xl rounded-full shadow-glow z-50"
    title="Restart Sound"
  >
    🔄
  </button>
);

const InteractionPrompt = ({ onStart }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="kbc-card p-8 text-center max-w-md mx-4">
      <h2 className="text-2xl text-kbc-gold mb-4">Welcome to KBC</h2>
      <p className="text-white mb-6">Click the button below to start your experience</p>
      <button 
        onClick={onStart}
        className="kbc-button1 animate-pulse"
      >
        Start Experience
      </button>
    </div>
  </div>
);

const GameRules = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSoundPaused, setIsSoundPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Audio states
  const [themeSound] = useState(() => {
    const audio = new Audio(themeAudio);
    audio.volume = 0.5;
    return audio;
  });

  const [questionSound] = useState(() => {
    const audio = new Audio(questionTune);
    audio.volume = 0.5;
    return audio;
  });

  // Utility function to stop all sounds
  const stopAllSounds = async () => {
    [themeSound, questionSound].forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
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

  // Handle restart sound
  const handleRestartSound = async () => {
    if (themeSound) {
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

  // Handle start game
  const handleStartGame = async () => {
    try {
      // Show loading state first
      setIsLoading(true);
      
      // Stop current sounds
      await stopAllSounds();
      
      // Play question sound
      await questionSound.play();
      
      // Navigate after sound finishes or max 5 seconds
      const navigationTimeout = setTimeout(() => {
        navigate(`/join-questions/${bankId}`);
      }, 5000);
      
      questionSound.onended = () => {
        clearTimeout(navigationTimeout);
        navigate(`/join-questions/${bankId}`);
      };
    } catch (error) {
      console.error("Error playing question sound:", error);
      // Still show loading for at least 1 second before navigation
      setTimeout(() => {
        navigate(`/join-questions/${bankId}`);
      }, 1000);
    }
  };

  // Handle visibility change
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  // Rotation animation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(rotationInterval);
  }, []);

  const rules = [
    {
      title: "Lifelines",
      items: [
        "50:50 - Removes two incorrect options",
        "Phone a Friend - Ask your friend for help",
        "Ask the Audience - See what the audience thinks"
      ]
    },
    {
      title: "Game Rules",
      items: [
        "Answer each question within the time limit",
        "Use lifelines wisely - each can be used only once",
        "Lock your answer to proceed to the next question",
        "Prize money increases with each correct answer",
        "Game ends with a wrong answer or quitting"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-kbc-dark-blue to-kbc-purple p-4 sm:p-8">
      {!hasUserInteracted && <InteractionPrompt onStart={handleStartExperience} />}
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Logo Animation */}
        <div className="text-center mb-8 relative">
          <div className="relative w-48 h-48 mx-auto">
            {/* Glowing background effect */}
            <div 
              className="absolute inset-0 rounded-full bg-kbc-gold opacity-20 blur-xl"
              style={{
                animation: 'pulse 2s infinite'
              }}
            />
            
            {/* Rotating rings */}
            <div 
              className="absolute inset-0 border-4 border-kbc-gold rounded-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                animation: 'glow 2s infinite'
              }}
            />
            <div 
              className="absolute inset-0 border-4 border-kbc-light-blue rounded-full"
              style={{
                transform: `rotate(-${rotation}deg)`,
                animation: 'glow 2s infinite alternate'
              }}
            />
            
            {/* Logo image */}
            <img 
              src={kbcLogo}
              alt="KBC Logo"
              className={`w-48 h-48 mx-auto transition-all duration-1000 rounded-full
                ${isAnimationComplete ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}
                mix-blend-luminosity
              `}
              style={{
                filter: 'brightness(1.2) contrast(1.2) drop-shadow(0 0 10px rgba(255,184,0,0.5))',
                animation: isAnimationComplete ? 'float 3s ease-in-out infinite' : 'none'
              }}
              onLoad={() => {
                setTimeout(() => setIsAnimationComplete(true), 100);
              }}
              onError={(e) => {
                console.error("Image failed to load");
                setImageError(true);
                setIsAnimationComplete(true);
              }}
            />
          </div>
        </div>

        {/* Show content regardless of image load state */}
        <div className={`space-y-8 transition-all duration-1000 ${
          isAnimationComplete ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
        }`}>
          <div className="kbc-card p-6 sm:p-8">
            <h1 className="text-4xl kbc-title text-center mb-8">Welcome to KBC</h1>
            
            {rules.map((section, index) => (
              <div key={index} className="mb-6">
                <h2 className="text-2xl text-kbc-gold mb-4">{section.title}</h2>
                <ul className="space-y-3">
                  {section.items.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start text-white">
                      <span className="text-kbc-gold mr-2">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-8 text-center">
              <button 
                onClick={handleStartGame}
                className="kbc-button1 animate-pulse hover:animate-none"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add restart sound button */}
      {isSoundPaused && (
        <RestartSoundButton onClick={handleRestartSound} />
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="relative w-24 h-24 mb-8">
            {/* Animated KBC logo with rotating rings */}
            <div className="absolute inset-0 rounded-full bg-kbc-gold opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-kbc-gold rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-0 border-4 border-kbc-light-blue rounded-full animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
            
            {/* Center K logo - simplified version */}
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-kbc-gold">K</div>
          </div>
          
          <p className="text-kbc-gold text-xl font-medium">Preparing Your Game...</p>
          
          {/* Animated dots */}
          <div className="flex space-x-2 mt-4">
            <div className="w-3 h-3 bg-kbc-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-kbc-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-kbc-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRules;