import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const JoinGame = () => {
  // Add admin passcode constant - you can change this value
  const ADMIN_PASSCODE = "1234"; 

  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankPasscode, setBankPasscode] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionbanks`, {
        credentials: 'include'
      });
      const data = await response.json();
      setQuestionBanks(data);
    } catch (error) {
      setError('Failed to load question banks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBank) {
      setError('Please select a question bank');
      return;
    }

    // Verify admin passcode first
    if (adminPasscode !== ADMIN_PASSCODE) {
      setError('Invalid admin passcode');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionBankId: selectedBank._id,
          passcode: bankPasscode
        }),
      });

      if (response.ok) {
        // Instead of navigating directly to join-questions
        navigate(`/game-rules/${selectedBank._id}`);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to join game');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex items-center space-x-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-4xl kbc-title">Join Game</h1>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
          <div className="kbc-card hover-card">
            <div className="kbc-form-group">
              <label className="kbc-label">Select Question Bank</label>
              <select
                value={selectedBank?._id || ''}
                onChange={(e) => setSelectedBank(questionBanks.find(bank => bank._id === e.target.value))}
                className="kbc-select"
                required
              >
                <option value="" disabled>Select a question bank</option>
                {questionBanks.map(bank => (
                  <option key={bank._id} value={bank._id}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="kbc-form-group">
              <label className="kbc-label">Question Bank Passcode</label>
              <input
                type="password"
                value={bankPasscode}
                onChange={(e) => setBankPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="kbc-input"
                pattern="\d{4}"
                maxLength="4"
                placeholder="Enter question bank passcode"
                required
              />
            </div>

            <div className="kbc-form-group">
              <label className="kbc-label">Admin Passcode</label>
              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="kbc-input"
                pattern="\d{4}"
                maxLength="4"
                placeholder="Enter admin passcode"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="kbc-button1">
              Join Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGame;