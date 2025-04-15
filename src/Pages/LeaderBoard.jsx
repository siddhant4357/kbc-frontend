import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define colors - matches your app's theme
  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
    light: '#E5E9FF',
    purple: '#4C1D95',
  };

  // Define all component styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      padding: '1rem',
      background: `radial-gradient(circle at center, ${colors.purple}15 0%, ${colors.darkBlue}15 100%)`,
      fontFamily: "'Poppins', sans-serif",
    },
    mainCard: {
      maxWidth: '72rem',
      margin: '0 auto',
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    title: {
      color: colors.gold,
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginLeft: '1rem',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    },
    clearButton: {
      background: `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`,
      color: colors.light,
      border: `1px solid ${colors.gold}`,
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '120px',
    },
    tableCard: {
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    tableHeader: {
      color: colors.gold,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      padding: '1rem',
      borderBottom: `1px solid rgba(255, 184, 0, 0.2)`,
      textAlign: 'left',
    },
    tableCell: {
      padding: '1rem',
      color: colors.light,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    goldText: {
      color: colors.gold,
      fontWeight: 600,
    },
    successText: {
      color: '#4ade80',
      fontWeight: 600,
    },
    emptyText: {
      textAlign: 'center',
      color: 'rgba(209, 213, 219, 1)',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    modalContent: {
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      maxWidth: '28rem',
      width: '100%',
      margin: '0 1rem',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: colors.gold,
      marginBottom: '1rem',
    },
    modalText: {
      color: 'rgba(209, 213, 219, 0.9)',
      marginBottom: '1.5rem',
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
    },
    deleteButton: {
      background: `linear-gradient(135deg, #ef4444, #b91c1c)`,
      color: colors.light,
      border: `1px solid ${colors.gold}`,
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      minWidth: '120px',
    },
    successAlert: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      color: 'rgba(167, 243, 208, 1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    errorAlert: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: 'rgba(252, 165, 165, 1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '3rem',
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: `4px solid ${colors.darkBlue}`,
      borderRadius: '50%',
      borderTopColor: colors.gold,
      animation: 'spin 1s ease-in-out infinite',
    },
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    mobileStyles: {
      '@media (max-width: 640px)': {
        title: { fontSize: '1.5rem' },
        clearButton: { padding: '0.5rem 1rem', fontSize: '0.875rem', minWidth: 'auto' },
        mainCard: { padding: '1rem' },
        tableCard: { padding: '1rem' },
        modalContent: { padding: '1rem' },
      }
    }
  };

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isAdmin) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/leaderboard`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleClearLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setLeaderboard([]);
        setSuccess('Leaderboard cleared successfully');
        setShowConfirmDialog(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error clearing leaderboard:', error);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 640px) {
            .title { font-size: 1.5rem; }
            .button { padding: 0.5rem 1rem; font-size: 0.875rem; min-width: auto; }
            .card { padding: 1rem; }
          }
        `}
      </style>

      <div style={styles.mainCard} className="card">
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <BackButton to="/dashboard" />
            <h1 style={styles.title} className="title">Leaderboard</h1>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            style={styles.clearButton}
            className="button"
            onMouseOver={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(28, 63, 170, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Clear Leaderboard
          </button>
        </div>

        {success && (
          <div style={styles.successAlert}>
            {success}
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        {showConfirmDialog && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent} className="card">
              <h2 style={styles.modalTitle}>Confirm Clear</h2>
              <p style={styles.modalText}>
                Are you sure you want to clear all points? This action cannot be undone.
              </p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  style={styles.clearButton}
                  className="button"
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`;
                    e.currentTarget.style.transform = '';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearLeaderboard}
                  style={styles.deleteButton}
                  className="button"
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  Clear All 
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.tableCard} className="card">
          <div style={styles.tableContainer}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Rank</th>
                    <th style={styles.tableHeader}>Username</th>
                    <th style={styles.tableHeader}>Points</th>
                    <th style={styles.tableHeader}>Correct Answers</th>
                    <th style={styles.tableHeader}>Total Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={user._id} style={{ transition: 'all 0.3s ease' }} 
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, rgba(28, 63, 170, 0.5), rgba(11, 29, 120, 0.5))`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '';
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                        }}>
                      <td style={styles.tableCell}>#{index + 1}</td>
                      <td style={{...styles.tableCell, ...styles.goldText}}>{user.username}</td>
                      <td style={{...styles.tableCell, ...styles.goldText}}>{user.points}</td>
                      <td style={{...styles.tableCell, ...styles.successText}}>{user.correctAnswers}</td>
                      <td style={styles.tableCell}>{user.totalAttempts}</td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{...styles.tableCell, ...styles.emptyText}}>
                        No leaderboard data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;