import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';
import kbcLogo from '../assets/kbc-logo.jpg';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStr));

    // Connect to Socket.IO server
    const socket = io(SOCKET_URL);

    // Listen for force logout event
    socket.on('forceLogout', () => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && !currentUser.isAdmin) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const DashboardCard = ({ title, icon, onCardClick }) => (
    <div 
      onClick={() => onCardClick(title)}
      className="dashboard-card"
    >
      <div className="card-icon">{icon}</div>
      <h2 className="card-title">{title}</h2>
    </div>
  );

  const AdminDashboard = () => {
    const handleCardClick = (title) => {
      switch(title) {
        case "Question Bank":
          navigate('/question-bank');
          break;
        case "Create Game":
          navigate('/create-question-bank');
          break;
        case "Manage Users":
          navigate('/manage-users');
          break;
        case "Manage Play Along":
          navigate('/manage-play-along');
          break;
        case "Leaderboard":
          navigate('/leaderboard');
          break;
        case "Join a Game":
          navigate('/join-game');
          break;
        default:
          break;
      }
    };

    return (
      <div className="dashboard-grid">
        <DashboardCard title="Manage Play Along" icon="📱" onCardClick={handleCardClick} />
        <DashboardCard title="Create Game" icon="🎮" onCardClick={handleCardClick} />
        <DashboardCard title="Question Bank" icon="📚" onCardClick={handleCardClick} />
        <DashboardCard title="Join a Game" icon="🎯" onCardClick={handleCardClick} />
        <DashboardCard title="Manage Users" icon="👥" onCardClick={handleCardClick} />
        <DashboardCard title="Leaderboard" icon="🏆" onCardClick={handleCardClick} />
      </div>
    );
  };

  const UserDashboard = () => {
    const handleCardClick = (title) => {
      switch(title) {
        case "Play Along":
          navigate('/play-along');
          break;
        case "Join a Game":
          navigate('/join-game');
          break;
        default:
          break;
      }
    };

    return (
      <div className="dashboard-grid">
        <DashboardCard title="Play Along" icon="📱" onCardClick={handleCardClick} />
        <DashboardCard title="Join a Game" icon="🎯" onCardClick={handleCardClick} />
      </div>
    );
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <style>
        {`
          .dashboard-container {
            min-height: 100vh;
            padding: 1rem;
            background: linear-gradient(135deg, #000B3E, #4C1D95);
            font-family: 'Poppins', sans-serif;
          }

          .dashboard-header {
            max-width: 1200px;
            margin: 0 auto 1.5rem;
          }

          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }

          .app-logo {
            width: 4rem;
            height: 4rem;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #FFB800;
            box-shadow: 0 0 15px rgba(255, 184, 0, 0.3);
          }

          .app-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: #FFB800;
            margin-left: 1rem;
          }

          .dashboard-content {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(11, 29, 120, 0.8);
            border: 1px solid rgba(255, 184, 0, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            position: relative;
            padding-bottom: 1rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
              rgba(255, 184, 0, 0), 
              rgba(255, 184, 0, 0.5) 50%, 
              rgba(255, 184, 0, 0)
            );
          }

          .welcome-section {
            display: flex;
            flex-direction: column;
          }

          .welcome-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #FFB800;
            margin: 0;
          }

          .welcome-subtitle {
            color: rgba(255, 255, 255, 0.7);
            margin-top: 0.5rem;
            font-size: 0.9rem;
          }

          .user-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 184, 0, 0.15);
            border: 1px solid rgba(255, 184, 0, 0.3);
            border-radius: 1rem;
            padding: 0.25rem 0.75rem;
            margin-top: 0.5rem;
            font-size: 0.8rem;
          }

          .user-badge-icon {
            margin-right: 0.5rem;
          }

          .logout-button {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #1C3FAA, #0B1D78);
            color: white;
            border: 1px solid #FFB800;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
          }

          .logout-button:hover {
            background: linear-gradient(135deg, #0B1D78, #1C3FAA);
          }

          .logout-icon {
            margin-right: 0.5rem;
          }

          .section-title {
            color: #FFB800;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
          }

          .section-title-icon {
            margin-right: 0.75rem;
          }

          /* Improved dashboard grid */
          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1rem;
            width: 100%;
          }

          /* Fixed card height and improved layout */
          .dashboard-card {
            background: rgba(0, 11, 62, 0.7);
            border: 1px solid rgba(28, 63, 170, 0.5);
            border-radius: 1rem;
            padding: 1.5rem 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            height: 160px;
            overflow: hidden;
          }

          .dashboard-card:hover {
            border-color: #FFB800;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }

          .card-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            transition: transform 0.3s ease;
          }

          .card-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: white;
            margin: 0;
          }

          /* Modal styles */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            z-index: 50;
          }

          .modal-content {
            background: rgba(11, 29, 120, 0.95);
            border: 1px solid rgba(255, 184, 0, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            width: 100%;
            max-width: 350px;
          }

          .modal-icon {
            font-size: 2rem;
            display: block;
            margin: 0 auto 1rem;
            text-align: center;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #FFB800;
            margin-bottom: 0.75rem;
            text-align: center;
          }

          .modal-text {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 1.5rem;
            text-align: center;
            font-size: 0.95rem;
          }

          .modal-buttons {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
          }

          .modal-button {
            padding: 0.75rem 1.25rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .cancel-button {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .confirm-button {
            background: #DC2626;
            color: white;
            border: 1px solid rgba(220, 38, 38, 0.5);
          }

          @media (max-width: 768px) {
            .dashboard-content {
              padding: 1rem;
            }

            .header {
              flex-direction: column;
              text-align: center;
              gap: 1rem;
            }

            .welcome-section {
              align-items: center;
            }

            .logout-button {
              width: 100%;
              justify-content: center;
            }
            
            .dashboard-grid {
              grid-template-columns: 1fr;
            }
            
            .dashboard-card {
              height: 140px;
            }

            .modal-buttons {
              flex-direction: column;
            }

            .modal-button {
              width: 100%;
            }
          }
          
          @media (min-width: 769px) and (max-width: 1023px) {
            .dashboard-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (min-width: 1024px) {
            .dashboard-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
      </style>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="logo-container">
            <img 
              src={kbcLogo} 
              alt="KBC Logo" 
              className="app-logo"
            />
            <span className="app-name">KBC Quiz Dashboard</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="header">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Welcome back, {user.username}!
              </h1>
              <p className="welcome-subtitle">
                Choose an option below to get started with your quiz experience
              </p>
              <div className="user-badge">
                <span className="user-badge-icon">👑</span>
                {user.isAdmin ? 'Administrator Access' : 'Quiz Participant'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>

          <h2 className="section-title">
            <span className="section-title-icon">🎮</span>
            {user.isAdmin ? 'Admin Controls' : 'Available Options'}
          </h2>

          {user.isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>

        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="modal-icon">🔒</span>
              <h2 className="modal-title">Confirm Logout</h2>
              <p className="modal-text">
                Are you sure you want to end your session and logout?
              </p>
              <div className="modal-buttons">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="modal-button cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="modal-button confirm-button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;