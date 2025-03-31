// frontend/src/Pages/GameRules.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import kbcLogo from '../assets/kbc-logo.jpg';
import themeAudio from '../assets/kbc_theme.wav';
import questionTune from '../assets/kbc_option_lock_tune.wav';
import { API_URL } from '../utils/config';

// Define color variables used throughout the component
const colors = {
  darkBlue: '#000B3E',
  blue: '#0B1D78',
  lightBlue: '#1C3FAA',
  gold: '#FFB800',
  light: '#E5E9FF',
  purple: '#4C1D95',
};

// Base style definitions
const styles = {
  // Containers
  pageContainer: {
    minHeight: '100vh',
    padding: '1rem',
    background: `linear-gradient(to bottom, ${colors.darkBlue}, ${colors.purple})`,
    fontFamily: "'Poppins', sans-serif",
  },
  contentContainer: {
    maxWidth: '48rem',
    margin: '0 auto',
  },
  
  // Logo and animation styles
  logoContainer: {
    textAlign: 'center',
    marginBottom: '2rem',
    position: 'relative',
  },
  logoInnerContainer: {
    position: 'relative',
    width: '12rem',
    height: '12rem',
    margin: '0 auto',
  },
  logoGlowEffect: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    backgroundColor: colors.gold,
    opacity: 0.2,
    filter: 'blur(1rem)',
    animation: 'pulse 2s infinite',
  },
  logoRing1: {
    position: 'absolute',
    inset: 0,
    border: `4px solid ${colors.gold}`,
    borderRadius: '50%',
    animation: 'glow 2s infinite',
  },
  logoRing2: {
    position: 'absolute',
    inset: 0,
    border: `4px solid ${colors.lightBlue}`,
    borderRadius: '50%',
    animation: 'glow 2s infinite alternate',
  },
  logoImage: {
    width: '12rem',
    height: '12rem',
    margin: '0 auto',
    transition: 'all 1s ease',
    borderRadius: '50%',
    filter: 'brightness(1.2) contrast(1.2) drop-shadow(0 0 10px rgba(255,184,0,0.5))',
    mixBlendMode: 'luminosity',
  },
  
  // Card styles
  card: {
    background: `linear-gradient(135deg, ${colors.blue}, ${colors.purple})`,
    clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
    border: `2px solid ${colors.lightBlue}`,
    boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
    padding: '1.5rem',
    borderRadius: '0.75rem',
    backdropFilter: 'blur(10px)',
  },
  
  // Typography
  title: {
    color: colors.gold,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    fontSize: '2.25rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.gold,
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  listItem: {
    display: 'flex',
    alignItems: 'start',
    color: 'white',
    marginBottom: '0.75rem',
  },
  listBullet: {
    color: colors.gold,
    marginRight: '0.5rem',
  },
  
  // Button styles
  button: {
    background: `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`,
    color: colors.light,
    border: `2px solid ${colors.gold}`,
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '120px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    animation: 'pulse 1.5s infinite',
    letterSpacing: '0.03em',
  },
  buttonHover: {
    background: `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(28, 63, 170, 0.4)',
    animation: 'none',
  },
  
  // Restart sound button
  restartButton: {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    width: '3rem',
    height: '3rem',
    background: `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`,
    color: colors.light,
    border: `1px solid ${colors.gold}`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(255, 184, 0, 0.2)',
    zIndex: 50,
  },
  
  // Interaction prompt overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    backdropFilter: 'blur(4px)',
  },
  promptCard: {
    background: `linear-gradient(135deg, ${colors.blue}, ${colors.purple})`,
    clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
    border: `2px solid ${colors.lightBlue}`,
    boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
    padding: '2rem',
    borderRadius: '0.75rem',
    textAlign: 'center',
    maxWidth: '24rem',
    margin: '0 1rem',
  },
  promptTitle: {
    color: colors.gold,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  promptText: {
    color: 'white',
    marginBottom: '1.5rem',
  },
  
  // Loading overlay
  loadingOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    backdropFilter: 'blur(4px)',
  },
  loadingLogoContainer: {
    position: 'relative',
    width: '6rem',
    height: '6rem',
    marginBottom: '2rem',
  },
  loadingText: {
    color: colors.gold,
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  loadingDotsContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  loadingDot: {
    width: '0.75rem',
    height: '0.75rem',
    backgroundColor: colors.gold,
    borderRadius: '50%',
  },
  
  // Animation keyframes
  '@keyframes pulse': {
    '0%': { transform: 'scale(0.95)', opacity: 0.5 },
    '50%': { transform: 'scale(1.05)', opacity: 0.8 },
    '100%': { transform: 'scale(0.95)', opacity: 0.5 },
  },
  '@keyframes glow': {
    '0%': { boxShadow: '0 0 5px ' + colors.gold + ', inset 0 0 5px ' + colors.gold, opacity: 0.3 },
    '100%': { boxShadow: '0 0 20px ' + colors.gold + ', inset 0 0 10px ' + colors.gold, opacity: 0.8 },
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

// Media query adjustments for responsive design
const mobileStyles = {
  pageContainer: {
    padding: '0.75rem',
  },
  card: {
    padding: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '1.5rem',
  },
  subtitle: {
    fontSize: '1.25rem',
  },
  logoInnerContainer: {
    width: '10rem',
    height: '10rem',
  },
  logoImage: {
    width: '10rem',
    height: '10rem',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    minWidth: 'auto',
  },
};

// Helper function to apply responsive styles
const applyResponsiveStyles = (baseStyles, isMobile) => {
  if (!isMobile) return baseStyles;
  
  return {
    ...baseStyles,
    ...(mobileStyles[Object.keys(baseStyles)[0]] || {})
  };
};

const RestartSoundButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.restartButton,
        ...(isHovered ? {
          transform: 'scale(1.1)',
          boxShadow: '0 0 20px rgba(255, 184, 0, 0.4)',
        } : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      🔄
    </button>
  );
};

const InteractionPrompt = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={styles.overlay}>
      <div style={applyResponsiveStyles(styles.promptCard, isMobile)}>
        <h2 style={styles.promptTitle}>Welcome to KBC</h2>
        <p style={styles.promptText}>Click the button below to start your experience</p>
        <button 
          onClick={onStart}
          style={{
            ...styles.button,
            ...(isHovered ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Start Experience
        </button>
      </div>
    </div>
  );
};

const GameRules = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isSoundPaused, setIsSoundPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [hoveredButton, setHoveredButton] = useState(null);

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

  // Detect screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div style={applyResponsiveStyles(styles.pageContainer, isMobile)}>
      {!hasUserInteracted && <InteractionPrompt onStart={handleStartExperience} />}
      
      <div style={styles.contentContainer}>
        {/* Enhanced Logo Animation */}
        <div style={styles.logoContainer}>
          <div style={applyResponsiveStyles(styles.logoInnerContainer, isMobile)}>
            {/* Glowing background effect */}
            <div 
              style={{
                ...styles.logoGlowEffect,
                animation: 'pulse 2s infinite',
              }}
            />
            
            {/* Rotating rings */}
            <div 
              style={{
                ...styles.logoRing1,
                transform: `rotate(${rotation}deg)`,
              }}
            />
            <div 
              style={{
                ...styles.logoRing2,
                transform: `rotate(-${rotation}deg)`,
              }}
            />
            
            {/* Logo image */}
            <img 
              src={kbcLogo}
              alt="KBC Logo"
              style={{
                ...applyResponsiveStyles(styles.logoImage, isMobile),
                opacity: isAnimationComplete ? 1 : 0,
                transform: isAnimationComplete ? 'scale(1)' : 'scale(1.5)',
                animation: isAnimationComplete ? 'float 3s ease-in-out infinite' : 'none',
              }}
              onLoad={() => {
                setTimeout(() => setIsAnimationComplete(true), 100);
              }}
              onError={() => {
                console.error("Image failed to load");
                setImageError(true);
                setIsAnimationComplete(true);
              }}
            />
          </div>
        </div>

        {/* Show content regardless of image load state */}
        <div style={{
          opacity: isAnimationComplete ? 1 : 0,
          transform: isAnimationComplete ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 1s ease',
        }}>
          <div style={applyResponsiveStyles(styles.card, isMobile)}>
            <h1 style={applyResponsiveStyles(styles.title, isMobile)}>Welcome to KBC</h1>
            
            {rules.map((section, index) => (
              <div key={index} style={{ marginBottom: '1.5rem' }}>
                <h2 style={applyResponsiveStyles(styles.subtitle, isMobile)}>{section.title}</h2>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {section.items.map((rule, ruleIndex) => (
                    <li key={ruleIndex} style={styles.listItem}>
                      <span style={styles.listBullet}>•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                onClick={handleStartGame}
                style={{
                  ...applyResponsiveStyles(styles.button, isMobile),
                  ...(hoveredButton === 'start' ? styles.buttonHover : {}),
                }}
                onMouseEnter={() => setHoveredButton('start')}
                onMouseLeave={() => setHoveredButton(null)}
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

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingLogoContainer}>
            <div style={{
              ...styles.logoGlowEffect,
              animation: 'pulse 1s infinite',
            }} />
            <div style={{
              ...styles.logoRing1,
              transform: `rotate(${rotation}deg)`,
            }} />
            <div style={{
              ...styles.logoRing2,
              transform: `rotate(-${rotation}deg)`,
            }} />
            <img 
              src={kbcLogo}
              alt="KBC Logo"
              style={{
                ...applyResponsiveStyles(styles.logoImage, isMobile),
                width: '6rem',
                height: '6rem',
                animation: 'bounce 1s infinite alternate',
              }}
            />
          </div>
          <p style={styles.loadingText}>Loading your game</p>
          <div style={styles.loadingDotsContainer}>
            <div style={{
              ...styles.loadingDot,
              animation: 'pulse 0.6s infinite alternate',
              animationDelay: '0s',
            }} />
            <div style={{
              ...styles.loadingDot,
              animation: 'pulse 0.6s infinite alternate',
              animationDelay: '0.2s',
            }} />
            <div style={{
              ...styles.loadingDot,
              animation: 'pulse 0.6s infinite alternate',
              animationDelay: '0.4s',
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRules;