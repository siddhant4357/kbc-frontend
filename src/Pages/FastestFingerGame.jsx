import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const FastestFingerGame = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [userSequence, setUserSequence] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fastest-finger/${bankId}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch game');
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError('Failed to load game');
        console.error(err);
      }
    };

    fetchGame();
  }, [bankId]);

  const handleOptionClick = (index) => {
    if (userSequence.includes(index)) {
      // Remove if already selected
      setUserSequence(prev => prev.filter(i => i !== index));
    } else {
      // Add to sequence
      setUserSequence(prev => [...prev, index]);
    }
  };

  const handleSubmit = async () => {
    if (userSequence.length !== 4) {
      setError('Please select all options in order');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you'll implement the logic to check if the sequence is correct
      // For now, just showing a success message
      setSuccess('Sequence submitted successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Failed to submit sequence');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-kbc-gold mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
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

        <div className="flex items-center space-x-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-4xl kbc-title">Fastest Finger First</h1>
        </div>

        <div className="space-y-6">
          <div className="kbc-card p-4">
            <h2 className="text-xl text-kbc-gold mb-4">{game.question.text}</h2>
            {game.question.imageUrl && (
              <img 
                src={game.question.imageUrl} 
                alt="Question" 
                className="max-w-full h-auto mb-4 rounded-lg"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {game.question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`kbc-option ${
                  userSequence.includes(index) ? 'selected' : ''
                }`}
                disabled={isSubmitting}
              >
                <span className="option-number">
                  {userSequence.includes(index) ? 
                    userSequence.indexOf(index) + 1 : 
                    ''}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || userSequence.length !== 4}
              className="kbc-button1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Sequence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastestFingerGame;