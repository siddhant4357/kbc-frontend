import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const FastestFingerHome = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fastest-finger`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError('Failed to load fastest finger games');
      }
    };

    fetchGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGame || !passcode) {
      setError('Please select a game and enter passcode');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/fastest-finger/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          bankId: selectedGame._id,
          passcode
        })
      });

      if (!response.ok) {
        throw new Error('Invalid passcode');
      }

      navigate(`/fastest-finger/${selectedGame._id}`);
    } catch (error) {
      setError(error.message || 'Failed to join game');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex items-center space-x-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-4xl kbc-title">Fastest Finger First</h1>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-kbc-gold text-sm mb-2">
              Select Game
            </label>
            <select
              value={selectedGame?._id || ''}
              onChange={(e) => setSelectedGame(games.find(g => g._id === e.target.value))}
              className="kbc-input"
              required
            >
              <option value="">-- Select a Game --</option>
              {games.map(game => (
                <option key={game._id} value={game._id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-kbc-gold text-sm mb-2">
              Enter Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="kbc-input"
              pattern="\d{4}"
              maxLength="4"
              required
            />
          </div>

          <button
            type="submit"
            className="kbc-button1 w-full"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default FastestFingerHome;