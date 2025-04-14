import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const CreateFastestFinger = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [question, setQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctSequence: [],
    imageUrl: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const handleSequenceChange = (value) => {
    const sequence = value.split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => ['A', 'B', 'C', 'D'].includes(s))
      .map(s => ['A', 'B', 'C', 'D'].indexOf(s));
    
    setQuestion({ ...question, correctSequence: sequence });
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/upload/fastest-finger-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setQuestion({ ...question, imageUrl: data.imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !passcode || !question.text || question.options.includes('') || question.correctSequence.length !== 4) {
      setError('Please fill all fields and provide correct sequence');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/fastest-finger/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          passcode,
          question
        }),
      });

      if (!response.ok) throw new Error('Failed to create fastest finger game');

      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setError(error.message || 'Failed to create game');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg">
            Fastest Finger question created successfully!
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg">
            {error}
          </div>
        )}

        <div className="flex items-center space-x-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-4xl kbc-title">Create Fastest Finger</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-kbc-gold text-sm mb-2">Game Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="kbc-input"
                required
              />
            </div>
            <div>
              <label className="block text-kbc-gold text-sm mb-2">Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="kbc-input"
                pattern="\d{4}"
                maxLength="4"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-kbc-gold text-sm mb-2">Question</label>
            <input
              type="text"
              value={question.text}
              onChange={(e) => setQuestion({ ...question, text: e.target.value })}
              className="kbc-input"
              required
            />
          </div>

          <div>
            <label className="block text-kbc-gold text-sm mb-2">Options (in correct sequence)</label>
            {question.options.map((option, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="kbc-input"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-kbc-gold text-sm mb-2">Correct Sequence (e.g., A,B,C,D)</label>
            <input
              type="text"
              onChange={(e) => handleSequenceChange(e.target.value)}
              className="kbc-input"
              placeholder="Enter sequence (e.g., A,B,C,D)"
              required
            />
          </div>

          <div>
            <label className="block text-kbc-gold text-sm mb-2">Question Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="kbc-input"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="kbc-button1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="kbc-button1"
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFastestFinger;