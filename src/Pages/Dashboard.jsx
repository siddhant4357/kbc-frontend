import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';

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

  // Update DashboardCard component
  const DashboardCard = ({ title, icon, onCardClick }) => (
    <div 
      className="kbc-option flex flex-col items-center p-8 text-center"
      onClick={() => onCardClick(title)}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
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
          navigate('/join-game'); // Update this
          break;
        default:
          // Handle other cases later
          break;
      }
    };

    return (
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
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
          navigate('/join-game'); // Update this
          break;
        default:
          break;
      }
    };

    return (
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
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
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl kbc-title">
            Welcome, {user.username}!
          </h1>
          <button
            onClick={handleLogout}
            className="kbc-button"
          >
            Logout
          </button>
        </div>

        <div className="animate-fadeIn">
          {user.isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="kbc-card w-full max-w-md p-4 sm:p-6">
              <h2 className="text-xl font-bold text-kbc-gold mb-4">Confirm Logout</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="kbc-button1 w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="kbc-button1 bg-red-600 hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;