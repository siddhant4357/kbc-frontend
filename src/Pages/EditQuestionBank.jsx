import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import defaultQuestionImage from '../assets/default_img.jpg';

const API_URL = import.meta.env.VITE_API_URL;

const EditQuestionBank = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionBank, setQuestionBank] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchQuestionBank = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questionbanks/${id}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuestionBank(data);
      } catch (error) {
        console.error('Error fetching question bank:', error);
        setError('Failed to load question bank. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionBank();
  }, [id]);

  const handleQuestionChange = (index, value) => {
    const updatedQuestionBank = { ...questionBank };
    updatedQuestionBank.questions[index].question = value;
    setQuestionBank(updatedQuestionBank);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestionBank = { ...questionBank };
    updatedQuestionBank.questions[questionIndex].options[optionIndex] = value;
    setQuestionBank(updatedQuestionBank);
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestionBank = { ...questionBank };
    updatedQuestionBank.questions[questionIndex].correctAnswer = value;
    setQuestionBank(updatedQuestionBank);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionbanks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(questionBank),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestionBank(data);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating question bank:', error);
      setError('Failed to update question bank. Please try again later.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionbanks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      navigate('/question-bank');
    } catch (error) {
      console.error('Error deleting question bank:', error);
      setError('Failed to delete question bank. Please try again later.');
    }
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
      
      const updatedQuestionBank = { ...questionBank };
      updatedQuestionBank.questions[questionIndex].imageUrl = data.imageUrl;
      setQuestionBank(updatedQuestionBank);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleRemoveImage = (questionIndex) => {
    const updatedQuestionBank = { ...questionBank };
    updatedQuestionBank.questions[questionIndex].imageUrl = '';
    setQuestionBank(updatedQuestionBank);
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
    <div className="text-xl text-gray-600">Loading...</div>
  </div>;

  if (error) return <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      <button onClick={() => navigate('/question-bank')} 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        Back to Question Banks
      </button>
    </div>
  </div>;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto kbc-card p-6 sm:p-8 rounded-xl">
        {success && (
          <div className="fixed top-4 right-4 bg-green-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg animate-fadeIn">
            Changes saved successfully!
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/question-bank" />
            <h1 className="text-4xl kbc-title">Edit Question Bank</h1>
          </div>
          <div className="space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="kbc-button1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="kbc-button1 bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="kbc-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="kbc-button1 bg-red-600 hover:bg-red-700"
                >
                  Delete Bank
                </button>
              </>
            )}
          </div>
        </div>

        {questionBank && (
          <div className="space-y-8 animate-fadeIn">
            <div className="kbc-card hover-card">
              <h2 className="text-2xl text-kbc-gold mb-4">{questionBank.name}</h2>
              <p className="text-gray-400">Passcode: {questionBank.passcode}</p>
            </div>

            <div className="space-y-6">
              {questionBank.questions.map((question, index) => (
                <div key={index} className="kbc-card hover-card animate-slideIn">
                  <h3 className="text-kbc-gold text-xl mb-4">Question {index + 1}</h3>
                  <div className="space-y-6">
                    {/* Question Text */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        className="kbc-input"
                      />
                    ) : (
                      <p className="text-white mb-4">{question.question}</p>
                    )}

                    {/* Image Section */}
                    <div className="mb-4">
                      {isEditing ? (
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(index, file);
                            }}
                            className="hidden"
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            className="kbc-button cursor-pointer px-4 py-2 text-sm"
                          >
                            {question.imageUrl ? 'Change Image' : 'Upload Image'}
                          </label>
                          
                          {question.imageUrl && (
                            <>
                              <img
                                src={`${API_URL}${question.imageUrl}`}
                                alt="Question"
                                className="h-20 w-20 object-cover rounded-lg shadow-glow"
                                onError={(e) => {
                                  console.warn('Error loading image');
                                  e.target.src = defaultQuestionImage; // Fallback image
                                  e.target.onerror = null; // Prevent infinite loop
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        question.imageUrl && (
                          <div className="flex justify-center">
                            <img
                              src={`${API_URL}${question.imageUrl}`}
                              alt="Question"
                              className="max-h-40 object-contain rounded-lg shadow-glow"
                              onError={(e) => {
                                console.warn('Error loading image');
                                e.target.src = defaultQuestionImage; // Fallback image
                                e.target.onerror = null; // Prevent infinite loop
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>

                    {/* Existing options grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                              className={`kbc-input ${
                                option === question.correctAnswer ? 'border-green-500' : ''
                              }`}
                            />
                          ) : (
                            <div className={`p-3 rounded-lg ${
                              option === question.correctAnswer 
                              ? 'bg-green-500 bg-opacity-20' 
                              : 'bg-gray-500 bg-opacity-20'
                            }`}>
                              {option}
                            </div>
                          )}
                          {isEditing && (
                            <input
                              type="radio"
                              name={`correctAnswer-${index}`}
                              checked={option === question.correctAnswer}
                              onChange={() => handleCorrectAnswerChange(index, option)}
                              className="ml-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add the delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="kbc-card p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-kbc-gold mb-4">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this question bank? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="kbc-button1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="kbc-button1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditQuestionBank;