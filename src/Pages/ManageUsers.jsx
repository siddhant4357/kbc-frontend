import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme colors
  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
    light: '#E5E9FF',
    purple: '#4C1D95',
    red: '#DC2626',
    darkRed: '#B91C1C',
    green: '#10B981',
  };

  // All component styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      padding: '1rem',
      background: `radial-gradient(circle at center, ${colors.purple}15 0%, ${colors.darkBlue}15 100%)`,
      fontFamily: "'Poppins', sans-serif",
    },
    cardContainer: {
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
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    title: {
      fontSize: '2.25rem',
      color: colors.gold,
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    },
    clearButton: {
      background: `linear-gradient(135deg, ${colors.red}, ${colors.darkRed})`,
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
    errorAlert: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: 'rgba(252, 165, 165, 1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
    },
    successAlert: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      color: 'rgba(167, 243, 208, 1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.5s ease-out forwards',
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
    cancelButton: {
      background: `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`,
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
    deleteButton: {
      background: `linear-gradient(135deg, ${colors.red}, ${colors.darkRed})`,
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
    emptyText: {
      textAlign: 'center',
      color: 'rgba(209, 213, 219, 0.5)',
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
    mobileStyles: {
      '@media (max-width: 640px)': {
        title: { fontSize: '1.5rem' },
        clearButton: { padding: '0.5rem 1rem', fontSize: '0.875rem', minWidth: 'auto' },
        cardContainer: { padding: '1rem' },
        tableCard: { padding: '1rem' },
        modalContent: { padding: '1rem' },
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    try {
      // Verify admin status locally first
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.isAdmin) {
        setError('Unauthorized: Admin access required');
        return;
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('Unauthorized: Admin access required');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccess('All users have been deleted');
      setUsers([]);
      setShowConfirmDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting users:', error);
      setError('Failed to delete users. Please try again later.');
      setTimeout(() => setError(''), 3000);
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
            .title { font-size: 1.5rem !important; }
            .button { padding: 0.5rem 1rem !important; font-size: 0.875rem !important; min-width: auto !important; }
            .card { padding: 1rem !important; }
          }
        `}
      </style>

      <div style={styles.cardContainer} className="card">
        <div style={styles.headerContainer}>
          <div style={styles.titleContainer}>
            <BackButton to="/dashboard" />
            <h1 style={styles.title} className="title">Manage Users</h1>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            style={styles.clearButton}
            className="button"
            onMouseOver={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.darkRed}, ${colors.red})`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.red}, ${colors.darkRed})`;
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Clear All Users
          </button>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            {success}
          </div>
        )}

        {showConfirmDialog && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent} className="card">
              <h2 style={styles.modalTitle}>Confirm Delete</h2>
              <p style={styles.modalText}>
                Are you sure you want to delete all users? This action cannot be undone.
              </p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  style={styles.cancelButton}
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
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllUsers}
                  style={styles.deleteButton}
                  className="button"
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${colors.darkRed}, ${colors.red})`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${colors.red}, ${colors.darkRed})`;
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  Delete All
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
                    <th style={styles.tableHeader}>Username</th>
                    <th style={styles.tableHeader}>Passcode</th>
                    <th style={styles.tableHeader}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
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
                      <td style={{...styles.tableCell, ...styles.goldText}}>{user.username}</td>
                      <td style={styles.tableCell}>{user.passcode}</td>
                      <td style={styles.tableCell}>{new Date(user.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{...styles.tableCell, ...styles.emptyText}}>
                        No users found
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

export default ManageUsers;