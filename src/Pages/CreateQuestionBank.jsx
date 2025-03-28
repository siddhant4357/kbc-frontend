import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { API_URL } from '../utils/config';

const CreateQuestionBank = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    imageUrl: '' // Add this field
  }]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleImageUpload = async (questionIndex, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/upload/question-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      const newQuestions = [...questions];
      newQuestions[questionIndex].imageUrl = data.imageUrl;
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const updateQuestionCount = (count) => {
    const newCount = parseInt(count);
    if (newCount > questions.length) {
      // Add new questions
      setQuestions([...questions, ...Array(newCount - questions.length).fill().map(() => ({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        imageUrl: '' // Add this field
      }))]);
    } else {
      // Remove questions from the end
      setQuestions(questions.slice(0, newCount));
    }
    setQuestionCount(newCount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const filteredQuestions = questions.filter(q => q.question && q.correctAnswer);
      const response = await fetch(`${API_URL}/api/questionbanks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          passcode,
          questions: filteredQuestions
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating question bank:', error);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg animate-fadeIn">
            Question bank created successfully! Redirecting...
          </div>
        )}

        <div className="flex items-center space-x-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-4xl kbc-title">Create Question Bank</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
          <div className="kbc-card hover-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-kbc-gold text-sm mb-2">Question Bank Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="kbc-input"
                  required
                />
              </div>
              <div>
                <label className="block text-kbc-gold text-sm mb-2">4-Digit Passcode</label>
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
              <div className="md:col-span-3">
                <label className="block text-kbc-gold text-sm mb-2">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={questionCount}
                  onChange={(e) => updateQuestionCount(e.target.value)}
                  className="kbc-input"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          {questions.map((q, questionIndex) => (
            <div key={questionIndex} className="kbc-card hover-card animate-slideIn">
              <h3 className="text-kbc-gold text-xl mb-4">Question {questionIndex + 1}</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-kbc-gold text-sm mb-2">Question</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                    className="kbc-input"
                    placeholder="Enter your question"
                  />
                </div>

                {/* Add image upload section */}
                <div>
                  <label className="block text-kbc-gold text-sm mb-2">Question Image (Optional)</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(questionIndex, file);
                      }}
                      className="hidden"
                      id={`image-upload-${questionIndex}`}
                    />
                    <label
                      htmlFor={`image-upload-${questionIndex}`}
                      className="kbc-button cursor-pointer px-4 py-2 text-sm"
                    >
                      {q.imageUrl ? 'Change Image' : 'Upload Image'}
                    </label>
                    {q.imageUrl && (
                      <>
                        <img
                          src={`${API_URL}${q.imageUrl}`}
                          alt="Question"
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newQuestions = [...questions];
                            newQuestions[questionIndex].imageUrl = '';
                            setQuestions(newQuestions);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <label className="block text-kbc-gold text-sm mb-2">
                        Option {String.fromCharCode(65 + optionIndex)}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                        className="kbc-input"
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-kbc-gold text-sm mb-2">Correct Answer</label>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => handleCorrectAnswerChange(questionIndex, e.target.value)}
                    className="kbc-select" // Changed from kbc-input to kbc-select
                  >
                    <option value="">Select correct answer</option>
                    {q.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option || `Option ${String.fromCharCode(65 + index)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

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
              Save Question Bank
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionBank;