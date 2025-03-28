import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const PlayAlong = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [passcode, setPasscode] = useState('');
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

    try {
      const response = await fetch(`${API_URL}/api/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionBankId: selectedBank._id,
          passcode
        }),
      });

      if (response.ok) {
        navigate(`/play-game/${selectedBank._id}`);
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
          <h1 className="text-4xl kbc-title">Join Play Along</h1>
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
                onTouchStart={(e) => {
                  // Allow native dropdown behavior on mobile
                  e.target.focus();
                }}
                onClick={(e) => {
                  // Force native dropdown behavior
                  e.target.click();
                }}
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
              <label className="kbc-label">Enter Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="kbc-input"
                pattern="\d{4}"
                maxLength="4"
                placeholder="Enter 4-digit passcode"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="kbc-button1"
            >
              Start Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayAlong;