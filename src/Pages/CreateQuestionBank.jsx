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
    imageUrl: ''
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
      // Store the full URL instead of just the path
      newQuestions[questionIndex].imageUrl = `${API_URL}${data.imageUrl}`;
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
        imageUrl: ''
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
    <>
      <style>
        {`
          /* Base Variables */
          :root {
            --kbc-dark-blue: #000B3E;
            --kbc-blue: #0B1D78;
            --kbc-light-blue: #1C3FAA;
            --kbc-gold: #FFB800;
            --kbc-light: #E5E9FF;
            --kbc-purple: #4C1D95;
          }

          /* General Layout */
          .min-h-screen {
            min-height: 100vh;
          }

          .p-4 {
            padding: 1rem;
          }

          .sm\\:p-8 {
            padding: 2rem;
          }

          .max-w-6xl {
            max-width: 72rem;
          }

          .mx-auto {
            margin-left: auto;
            margin-right: auto;
          }

          /* Card Styles */
          .kbc-card {
            background: linear-gradient(135deg, var(--kbc-dark-blue), var(--kbc-purple));
            clip-path: polygon(
              5% 0,
              95% 0,
              100% 5%,
              100% 95%,
              95% 100%,
              5% 100%,
              0 95%,
              0 5%
            );
            border: 2px solid var(--kbc-light-blue);
            box-shadow: 0 0 20px rgba(28, 63, 170, 0.3),
                        inset 0 0 15px rgba(28, 63, 170, 0.3);
            padding: 1.5rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
          }

          .hover-card {
            transition: all 0.3s ease;
          }

          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }

          .rounded-xl {
            border-radius: 0.75rem;
          }

          .p-6 {
            padding: 1.5rem;
          }

          .sm\\:p-8 {
            padding: 2rem;
          }

          /* Success Notification */
          .fixed {
            position: fixed;
          }

          .top-4 {
            top: 1rem;
          }

          .right-4 {
            right: 1rem;
          }

          .bg-green-500 {
            background-color: #10B981;
          }

          .bg-opacity-90 {
            background-opacity: 0.9;
          }

          .text-white {
            color: white;
          }

          .shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Header Styles */
          .flex {
            display: flex;
          }

          .items-center {
            align-items: center;
          }

          .space-x-4 > * + * {
            margin-left: 1rem;
          }

          .mb-8 {
            margin-bottom: 2rem;
          }

          .text-4xl {
            font-size: 2.25rem;
          }

          .kbc-title {
            color: var(--kbc-gold);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            font-weight: bold;
            margin-bottom: 1.5rem;
          }

          /* Form Layout */
          .space-y-8 > * + * {
            margin-top: 2rem;
          }

          .grid {
            display: grid;
          }

          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }

          .gap-6 {
            gap: 1.5rem;
          }

          .md\\:col-span-2 {
            grid-column: span 2 / span 2;
          }

          .md\\:col-span-3 {
            grid-column: span 3 / span 3;
          }

          @media (min-width: 768px) {
            .md\\:grid-cols-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
            
            .md\\:grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          /* Form Elements */
          .block {
            display: block;
          }

          .text-kbc-gold {
            color: var(--kbc-gold);
          }

          .text-sm {
            font-size: 0.875rem;
          }

          .mb-2 {
            margin-bottom: 0.5rem;
          }

          .text-xl {
            font-size: 1.25rem;
          }

          .mb-4 {
            margin-bottom: 1rem;
          }

          /* Improved input styles */
          .kbc-input {
            width: 100%; /* Full width */
            padding: 0.75rem 1rem;
            background: rgba(0, 11, 62, 0.6);
            border: 2px solid rgba(28, 63, 170, 0.5);
            border-radius: 0.75rem;
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-sizing: border-box; /* This ensures padding is included in width */
            max-width: 100%; /* Ensure input doesn't overflow container */
            overflow: hidden; /* Prevent text overflow */
            text-overflow: ellipsis; /* Show ellipsis for overflowing text */
          }

          .kbc-input:focus {
            outline: none;
            border-color: var(--kbc-gold);
            box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.25);
            background: rgba(0, 11, 62, 0.8);
          }

          .kbc-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          .kbc-select {
            width: 100%;
            max-width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 11, 62, 0.6);
            border: 2px solid rgba(28, 63, 170, 0.5);
            border-radius: 0.75rem;
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFB800'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1.5em;
            padding-right: 2.5rem;
            box-sizing: border-box; /* This ensures padding is included in width */
          }

          .kbc-select:focus {
            outline: none;
            border-color: var(--kbc-gold);
            box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.25);
            background: rgba(0, 11, 62, 0.8);
          }

          .space-y-6 > * + * {
            margin-top: 1.5rem;
          }

          /* Image Upload */
          .hidden {
            display: none;
          }

          .cursor-pointer {
            cursor: pointer;
          }

          .px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .py-2 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }

          /* Improved Back Button */
          .back-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--kbc-blue), var(--kbc-dark-blue));
            color: var(--kbc-gold);
            border: 1px solid var(--kbc-gold);
            border-radius: 50%;
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1.25rem;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 184, 0, 0.2);
          }

          .back-button:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 0 15px rgba(255, 184, 0, 0.3);
          }

          /* Buttons */
          .kbc-button {
            background: linear-gradient(135deg, var(--kbc-light-blue), var(--kbc-blue));
            color: var(--kbc-light);
            border: 1px solid var(--kbc-gold);
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 90px;
          }

          .kbc-button:hover {
            background: linear-gradient(135deg, var(--kbc-blue), var(--kbc-dark-blue));
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(28, 63, 170, 0.3);
          }

          .h-20 {
            height: 5rem;
          }

          .w-20 {
            width: 5rem;
          }

          .object-cover {
            object-fit: cover;
          }

          .rounded-lg {
            border-radius: 0.5rem;
          }

          .text-red-500 {
            color: #EF4444;
          }

          .hover\\:text-red-700:hover {
            color: #B91C1C;
          }

          /* Buttons at Bottom */
          .justify-end {
            justify-content: flex-end;
          }

          .kbc-button1 {
            background: linear-gradient(135deg, var(--kbc-light-blue), var(--kbc-blue));
            color: var(--kbc-light);
            border: 2px solid var(--kbc-gold);
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 1.1rem;
            letter-spacing: 0.03em;
            transition: all 0.3s ease;
            cursor: pointer;
            padding: 0.75rem 1.5rem;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 120px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .kbc-button1:hover {
            background: linear-gradient(135deg, var(--kbc-blue), var(--kbc-dark-blue));
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(28, 63, 170, 0.4);
          }

          /* Animation for question cards */
          .animate-slideIn {
            animation: slideIn 0.5s ease-out forwards;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Media Queries */
          @media (max-width: 640px) {
            .space-x-4 {
              display: flex;
              flex-wrap: wrap;
              gap: 0.75rem;
            }

            .kbc-button1 {
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              min-width: auto;
            }
            
            .kbc-card {
              padding: 1rem;
            }
            
            .kbc-title {
              font-size: 1.5rem;
            }
            
            .back-button {
              width: 2rem;
              height: 2rem;
              font-size: 1rem;
            }

            /* Fixed mobile input issues */
            .grid-cols-1 {
              width: 100%;
            }
            
            .kbc-input, .kbc-select {
              font-size: 16px; /* Prevent mobile zooming on focus */
              min-width: 0; /* Allow shrinking below content size */
            }
            
            .md\\:grid-cols-3 {
              grid-template-columns: 1fr;
            }
            
            /* Fix for container width issues */
            .md\\:col-span-2, .md\\:col-span-3 {
              grid-column: span 1 / span 1;
              width: 100%;
            }
            
            /* Adjust form layout for mobile */
            .flex.items-center {
              flex-wrap: wrap;
            }
            
            /* Ensure proper form spacing on mobile */
            .space-y-8 > * + * {
              margin-top: 1rem;
            }

            /* Fix padding and overflow */
            .p-6 {
              padding: 0.75rem;
            }
          }
        `}
      </style>

      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
          {showSuccess && (
            <div className="fixed top-4 right-4 bg-green-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg animate-fadeIn">
              Question bank created successfully! Redirecting...
            </div>
          )}

          <div className="flex items-center space-x-4 mb-8">
            {/* Custom back button */}
            <button onClick={() => navigate('/dashboard')} className="back-button">
              ←
            </button>
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
                            src={q.imageUrl}
                            alt="Question"
                            className="h-20 w-20 object-cover rounded-lg"
                            onError={(e) => {
                              console.warn('Error loading image');
                              e.target.style.display = 'none';
                            }}
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
                      className="kbc-select"
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
    </>
  );
};

export default CreateQuestionBank;