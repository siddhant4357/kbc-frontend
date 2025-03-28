import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isAdmin) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard data');
    }
  };

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
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/dashboard" />
            <h1 className="text-4xl kbc-title">Leaderboard</h1>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="kbc-button1"
          >
            Clear Leaderboard
          </button>
        </div>

        {success && (
          <div className="bg-green-500 bg-opacity-20 text-green-100 p-4 rounded-lg mb-6 animate-fadeIn">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6 animate-fadeIn">
            {error}
          </div>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="kbc-card p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold kbc-title mb-4">Confirm Clear</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to clear all points? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="kbc-button1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearLeaderboard}
                  className="kbc-button1 bg-red-600 hover:bg-red-700"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="kbc-card">
          <div className="overflow-x-auto">
            <table className="kbc-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Points</th>
                  <th>Correct Answers</th>
                  <th>Total Attempts</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user._id}>
                    <td>#{index + 1}</td>
                    <td className="gold-text">{user.username}</td>
                    <td className="gold-text">{user.points}</td>
                    <td className="success-text">{user.correctAnswers}</td>
                    <td>{user.totalAttempts}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-400">
                      No leaderboard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;