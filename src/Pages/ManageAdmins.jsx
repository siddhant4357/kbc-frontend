import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';
import BackButton from '../components/BackButton';

const ManageAdmins = () => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username,
          passcode,
          adminPasscode
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Admin created successfully');
        setUsername('');
        setPasscode('');
        setAdminPasscode('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create admin');
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-kbc-dark-blue to-kbc-purple">
      <div className="max-w-xl mx-auto">
        <BackButton to="/dashboard" />
        <h1 className="text-3xl font-bold text-kbc-gold mb-8">Manage Admins</h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/20 text-green-300 p-4 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-6">
          <div>
            <label className="text-kbc-gold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="kbc-input w-full"
              required
            />
          </div>

          <div>
            <label className="text-kbc-gold">Passcode (4 digits)</label>
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="kbc-input w-full"
              pattern="\d{4}"
              required
            />
          </div>

          <div>
            <label className="text-kbc-gold">Admin Passcode (4 digits)</label>
            <input
              type="text"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="kbc-input w-full"
              pattern="\d{4}"
              required
            />
          </div>

          <button
            type="submit"
            className="kbc-button w-full"
          >
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageAdmins;