import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const QuestionBank = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true); // Initial loading state for the whole page
  const [loading, setLoading] = useState(false); // Loading state for individual bank clicks
  const [clickedBankId, setClickedBankId] = useState(null); // Track which bank was clicked
  const navigate = useNavigate();

  // CSS Variables for consistent styling
  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
    light: '#E5E9FF',
    purple: '#4C1D95',
  };

  useEffect(() => {
    const fetchQuestionBanks = async () => {
      try {
        // Add slight delay to show loading state (can be removed in production)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch(`${API_URL}/api/questionbanks`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuestionBanks(data);
      } catch (error) {
        console.error('Error fetching question banks:', error);
        setError('Failed to load question banks. Please try again later.');
        setQuestionBanks([]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchQuestionBanks();
  }, []);

  const handleBankClick = async (bankId) => {
    setClickedBankId(bankId);
    setLoading(true);
    
    // Add a small delay to show the loading animation
    // This gives a smoother user experience even if the load is quick
    setTimeout(() => {
      navigate(`/edit-question-bank/${bankId}`);
    }, 800); // 800ms delay for visual effect - slightly longer to show the animation
  };

  // Enhanced styles for the loading animations
  const styles = {
    loadingOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(11, 29, 120, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: '0.75rem',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      border: '1px solid rgba(255, 184, 0, 0.3)'
    },
    loadingRing: {
      position: 'relative',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      perspective: '800px',
    },
    loadingRingInner1: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: `3px solid transparent`,
      borderTopColor: colors.gold,
      animation: 'spinRing1 1s linear infinite',
    },
    loadingRingInner2: {
      position: 'absolute',
      width: '70%',
      height: '70%',
      top: '15%',
      left: '15%',
      borderRadius: '50%',
      border: `3px solid transparent`,
      borderTopColor: colors.lightBlue,
      animation: 'spinRing2 1.2s linear infinite',
    },
    loadingRingInner3: {
      position: 'absolute',
      width: '40%',
      height: '40%',
      top: '30%',
      left: '30%',
      borderRadius: '50%',
      border: `3px solid transparent`,
      borderTopColor: colors.light,
      animation: 'spinRing3 1.5s linear infinite',
    },
    loadingText: {
      position: 'absolute',
      bottom: '25%',
      color: colors.gold,
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      animation: 'pulseText 1.5s infinite ease-in-out',
    },
    loadingProgressBar: {
      position: 'absolute',
      bottom: '15%',
      width: '60%',
      height: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px',
      overflow: 'hidden',
    },
    loadingProgressInner: {
      height: '100%',
      width: '30%',
      backgroundColor: colors.gold,
      borderRadius: '2px',
      animation: 'progress 1.5s infinite ease-in-out',
    },
    cardContainer: {
      position: 'relative',
      transition: 'all 0.3s ease',
    },
    initialLoadingContainer: {
      minHeight: '60vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    pulseEffect: {
      animation: 'pulse 1.5s infinite ease-in-out',
    },
    loadingRipple: {
      position: 'absolute',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: `2px solid ${colors.gold}`,
      opacity: 0,
      animation: 'ripple 2s infinite ease-out',
    },
    shimmerSkeleton: {
      height: '120px',
      opacity: 0.7,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(28, 63, 170, 0.3)',
      background: 'linear-gradient(135deg, rgba(0, 11, 62, 0.7), rgba(11, 29, 120, 0.7))',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      padding: '1rem',
    },
    shimmerLine: {
      height: '20px',
      marginBottom: '10px',
      borderRadius: '4px',
      animation: 'shimmer 1.5s infinite linear',
      background: 'linear-gradient(to right, rgba(28, 63, 170, 0.1) 8%, rgba(255, 184, 0, 0.2) 18%, rgba(28, 63, 170, 0.1) 33%)',
      backgroundSize: '800px 104px',
    },
    shimmerLineShort: {
      width: '60%',
      height: '15px',
      marginTop: '10px',
      borderRadius: '4px',
      animation: 'shimmer 1.5s infinite linear',
      background: 'linear-gradient(to right, rgba(28, 63, 170, 0.1) 8%, rgba(255, 184, 0, 0.2) 18%, rgba(28, 63, 170, 0.1) 33%)',
      backgroundSize: '800px 104px',
      animationDelay: '0.2s',
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <style>
          {`
            @keyframes spinRing1 {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes spinRing2 {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            
            @keyframes spinRing3 {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulseText {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
            
            @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
            
            @keyframes ripple {
              0% { transform: scale(0.8); opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
            
            @keyframes shimmer {
              0% { background-position: -468px 0 }
              100% { background-position: 468px 0 }
            }
            
            @keyframes pulse {
              0% { opacity: 0.6; transform: scale(0.98); }
              50% { opacity: 1; transform: scale(1); }
              100% { opacity: 0.6; transform: scale(0.98); }
            }
            
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fadeUp {
              animation: fadeUp 0.5s ease forwards;
            }
            
            .delay-100 {
              animation-delay: 0.1s;
            }
            
            .delay-200 {
              animation-delay: 0.2s;
            }
          `}
        </style>
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/dashboard" />
            <h1 className="text-4xl kbc-title">Question Banks</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6 animate-fadeUp">
            {error}
          </div>
        )}

        {initialLoading ? (
          <div style={styles.initialLoadingContainer}>
            {/* Animated ripple effect */}
            <div style={styles.loadingRipple}></div>
            <div style={{...styles.loadingRipple, animationDelay: '0.5s'}}></div>
            <div style={{...styles.loadingRipple, animationDelay: '1s'}}></div>
            
            {/* Loading rings */}
            <div style={styles.loadingRing}>
              <div style={styles.loadingRingInner1}></div>
              <div style={styles.loadingRingInner2}></div>
              <div style={styles.loadingRingInner3}></div>
            </div>
            
            <p style={{...styles.loadingText, ...styles.pulseEffect, marginTop: '4.5rem'}}>
              Loading Question Banks...
            </p>
            
            {/* Progress bar */}
            <div style={{...styles.loadingProgressBar, marginTop: '6.5rem'}}>
              <div style={styles.loadingProgressInner}></div>
            </div>
            
            {/* Enhanced skeleton loaders for a nicer experience */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-fadeUp" style={{animationDelay: `${item * 0.1}s`}}>
                  <div style={styles.shimmerLine}></div>
                  <div style={{...styles.shimmerLine, width: '80%'}}></div>
                  <div style={styles.shimmerLineShort}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionBanks.map((bank, index) => (
              <div
                key={bank._id}
                onClick={() => handleBankClick(bank._id)}
                className="kbc-card hover-card cursor-pointer animate-fadeUp"
                style={{
                  ...styles.cardContainer,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {loading && clickedBankId === bank._id && (
                  <div style={styles.loadingOverlay}>
                    <div style={styles.loadingRing}>
                      <div style={styles.loadingRingInner1}></div>
                      <div style={styles.loadingRingInner2}></div>
                      <div style={styles.loadingRingInner3}></div>
                    </div>
                    <p style={{...styles.loadingText, ...styles.pulseEffect}}>
                      Opening bank...
                    </p>
                    <div style={styles.loadingProgressBar}>
                      <div style={styles.loadingProgressInner}></div>
                    </div>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-kbc-gold mb-4">{bank.name}</h2>
                <p className="text-gray-300">Questions: {bank.questions.length}</p>
                <p className="text-gray-400 mt-2">Passcode: {bank.passcode}</p>
              </div>
            ))}
          </div>
        )}

        {!initialLoading && questionBanks.length === 0 && !error && (
          <div className="text-center text-gray-400 py-8 animate-fadeUp">
            No question banks found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;