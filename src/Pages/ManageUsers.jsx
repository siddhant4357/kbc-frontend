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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
    }
  };

  const handleDeleteAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccess('All users have been deleted and logged out');
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
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/dashboard" />
            <h1 className="text-4xl kbc-title">Manage Users</h1>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="kbc-button bg-red-600 hover:bg-red-700"
          >
            Clear All Users
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 text-green-100 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="kbc-card p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold kbc-title mb-4">Confirm Delete</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete all users? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="kbc-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllUsers}
                  className="kbc-button bg-red-600 hover:bg-red-700"
                >
                  Delete All
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
                  <th>Username</th>
                  <th>Passcode</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="gold-text">{user.username}</td>
                    <td>{user.passcode}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-400">
                      No users found
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

export default ManageUsers;