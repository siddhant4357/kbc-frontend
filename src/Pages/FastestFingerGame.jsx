import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const FastestFingerGame = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [randomizedOptions, setRandomizedOptions] = useState([]);
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
        
        // Randomize the options when game data is loaded
        const shuffledOptions = [...data.question.options]
          .map((option, index) => ({ option, originalIndex: index }))
          .sort(() => Math.random() - 0.5);
        setRandomizedOptions(shuffledOptions);
      } catch (err) {
        setError('Failed to load game');
        console.error(err);
      }
    };

    fetchGame();
  }, [bankId]);

  const handleOptionClick = (originalIndex) => {
    if (userSequence.includes(originalIndex)) {
      // Remove if already selected
      setUserSequence(prev => prev.filter(i => i !== originalIndex));
    } else if (userSequence.length < 4) {
      // Add to sequence if less than 4 selections
      setUserSequence(prev => [...prev, originalIndex]);
    }
  };

  const handleSubmit = async () => {
    if (userSequence.length !== 4) {
      setError('Please select all options in sequence');
      return;
    }

    setIsSubmitting(true);
    try {
      // Compare user sequence with correct sequence
      const isCorrect = JSON.stringify(userSequence) === JSON.stringify(game.question.correctSequence);
      
      // Send result to backend
      const response = await fetch(`${API_URL}/api/fastest-finger/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          bankId,
          sequence: userSequence,
          isCorrect
        })
      });

      if (!response.ok) throw new Error('Failed to submit sequence');

      setSuccess(isCorrect ? 'Correct sequence! Well done!' : 'Wrong sequence. Try again!');
      setTimeout(() => {
        if (isCorrect) navigate('/dashboard');
        else {
          setUserSequence([]);
          setSuccess('');
        }
      }, 2000);
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
            {randomizedOptions.map(({ option, originalIndex }, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(originalIndex)}
                className={`kbc-option ${
                  userSequence.includes(originalIndex) ? 'selected' : ''
                }`}
                disabled={isSubmitting}
              >
                <span className="option-number">
                  {userSequence.includes(originalIndex) ? 
                    (userSequence.indexOf(originalIndex) + 1) : 
                    ''}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          <div className="text-center text-kbc-gold mb-4">
            Click options in the correct sequence
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