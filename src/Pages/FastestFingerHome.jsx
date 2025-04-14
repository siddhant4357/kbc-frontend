import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';

const FastestFingerHome = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fastest-finger`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        setQuestionBanks(data);
      } catch (err) {
        setError('Failed to load fastest finger games');
      }
    };

    fetchBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBank || !password) {
      setError('Please select a game and enter passcode');
      return;
    }

    try {
      // Verify passcode
      if (password !== selectedBank.passcode) {
        setError('Invalid passcode');
        return;
      }

      navigate(`/fastest-finger/${selectedBank._id}`);
    } catch (error) {
      setError('Failed to join game');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Fastest Finger First</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">
              Select Question Bank
            </label>
            <select
              value={selectedBank ? selectedBank._id : ''}
              onChange={(e) => {
                const bank = questionBanks.find(
                  (b) => b._id === e.target.value
                );
                setSelectedBank(bank);
              }}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">-- Choose Bank --</option>
              {questionBanks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Enter Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FastestFingerHome;