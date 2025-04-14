import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';

const FastestFingerCreate = () => {
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [sequence, setSequence] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Admin check
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.isAdmin) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!question || !optionA || !optionB || !optionC || !optionD || !sequence) {
      setError('Please fill in all fields.');
      return;
    }
    // Prepare payload. Expecting sequence as a comma separated list of option letters.
    const payload = {
      question,
      options: [optionA, optionB, optionC, optionD],
      sequence: sequence.split(',').map(s => s.trim().toUpperCase())
    };

    try {
      const response = await fetch(`${API_URL}/api/fastest-finger/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Fastest Finger Game</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">Game created successfully! Redirecting...</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter the question"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Option A</label>
            <input
              type="text"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter option A"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Option B</label>
            <input
              type="text"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter option B"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Option C</label>
            <input
              type="text"
              value={optionC}
              onChange={(e) => setOptionC(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter option C"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Option D</label>
            <input
              type="text"
              value={optionD}
              onChange={(e) => setOptionD(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter option D"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Answer Sequence
            </label>
            <input
              type="text"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder='e.g., "A,B,C,D"'
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Save Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default FastestFingerCreate;