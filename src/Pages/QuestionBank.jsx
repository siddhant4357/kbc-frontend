import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const QuestionBank = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionBanks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questionbanks`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuestionBanks(data);
      } catch (error) {
        console.error('Error fetching question banks:', error);
        setError('Failed to load question banks. Please try again later.');
        setQuestionBanks([]);
      }
    };

    fetchQuestionBanks();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/dashboard" />
            <h1 className="text-4xl kbc-title">Question Banks</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {questionBanks.map((bank) => (
            <div
              key={bank._id}
              onClick={() => navigate(`/edit-question-bank/${bank._id}`)}
              className="kbc-card hover-card cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-kbc-gold mb-4">{bank.name}</h2>
              <p className="text-gray-300">Questions: {bank.questions.length}</p>
              <p className="text-gray-400 mt-2">Passcode: {bank.passcode}</p>
            </div>
          ))}
        </div>

        {questionBanks.length === 0 && !error && (
          <div className="text-center text-gray-400 py-8">
            No question banks found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;