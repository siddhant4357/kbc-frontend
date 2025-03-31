import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultQuestionImage from '../assets/default_img.jpg';
import BackButton from '../components/BackButton';

const API_URL = import.meta.env.VITE_API_URL;

// CSS Variables
const colors = {
  darkBlue: '#000B3E',
  blue: '#0B1D78',
  lightBlue: '#1C3FAA',
  gold: '#FFB800',
  light: '#E5E9FF',
  purple: '#4C1D95',
  red: '#DC2626',
  green: '#10B981',
  gray: '#6B7280'
};

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

  // Styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      padding: '1rem',
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      fontFamily: "'Poppins', sans-serif"
    },
    contentContainer: {
      maxWidth: '72rem',
      margin: '0 auto',
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)'
    },
    cardContainer: {
      background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purple})`,
      clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
      border: `2px solid ${colors.lightBlue}`,
      boxShadow: `0 0 20px rgba(28, 63, 170, 0.3), inset 0 0 15px rgba(28, 63, 170, 0.3)`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      marginBottom: '1rem'
    },
    hoverCard: {
      transform: 'translateY(-5px)',
      boxShadow: `0 10px 20px rgba(0, 0, 0, 0.2)`
    },
    flexRow: {
      display: 'flex',
      alignItems: 'center'
    },
    flexBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    flexSpace: {
      marginLeft: '1rem'
    },
    buttonSpace: {
      marginLeft: '1rem'
    },
    kbcTitle: {
      color: colors.gold,
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      fontWeight: 'bold',
      fontSize: '2.25rem',
      marginBottom: '1.5rem'
    },
    kbcSubTitle: {
      color: colors.gold,
      fontSize: '1.5rem',
      marginBottom: '1rem'
    },
    questionTitle: {
      color: colors.gold,
      fontSize: '1.25rem',
      marginBottom: '1rem'
    },
    text: {
      color: colors.light
    },
    textGray: {
      color: '#a0aec0'
    },
    button: {
      background: `linear-gradient(135deg, ${colors.lightBlue}, ${colors.blue})`,
      color: colors.light,
      border: `1px solid ${colors.gold}`,
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '120px'
    },
    buttonHover: {
      background: `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(28, 63, 170, 0.3)'
    },
    redButton: {
      background: `linear-gradient(135deg, ${colors.red}, #b91c1c)`,
    },
    greenButton: {
      background: `linear-gradient(135deg, ${colors.green}, #059669)`,
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0, 11, 62, 0.6)',
      border: '2px solid rgba(28, 63, 170, 0.5)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    inputFocus: {
      outline: 'none',
      borderColor: colors.gold,
      boxShadow: '0 0 0 3px rgba(255, 184, 0, 0.25)',
      background: 'rgba(0, 11, 62, 0.8)'
    },
    successNotification: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      background: 'rgba(16, 185, 129, 0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      animation: 'fadeIn 0.5s ease-out forwards'
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    },
    modalContent: {
      background: 'rgba(11, 29, 120, 0.95)',
      border: `1px solid rgba(255, 184, 0, 0.3)`,
      borderRadius: '1rem',
      padding: '1.5rem',
      width: '100%',
      maxWidth: '28rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: colors.gold,
      marginBottom: '0.75rem',
      textAlign: 'center'
    },
    modalText: {
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '1.5rem',
      textAlign: 'center',
      fontSize: '0.95rem'
    },
    modalButtons: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
    gridMd: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    optionBox: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(107, 114, 128, 0.2)'
    },
    correctOptionBox: {
      padding: '0.75rem',
      borderRadius: '0.5rem', 
      backgroundColor: 'rgba(16, 185, 129, 0.2)'
    },
    flexCenter: {
      display: 'flex',
      justifyContent: 'center'
    },
    imageContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    smallImage: {
      height: '5rem',
      width: '5rem',
      objectFit: 'cover',
      borderRadius: '0.5rem',
      boxShadow: '0 0 15px rgba(255, 184, 0, 0.2)'
    },
    largeImage: {
      maxHeight: '10rem',
      objectFit: 'contain',
      borderRadius: '0.5rem',
      boxShadow: '0 0 15px rgba(255, 184, 0, 0.2)'
    },
    removeButton: {
      color: '#EF4444',
      cursor: 'pointer'
    },
    removeButtonHover: {
      color: '#B91C1C'
    },
    marginBottom: {
      marginBottom: '1rem'
    },
    spaceY: {
      marginTop: '2rem'
    },
    animation: {
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      '@keyframes slideIn': {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' }
      }
    },
    backButtonContainer: {
      padding: '0.25rem',
      borderRadius: '0.5rem',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonContainerHover: {
      backgroundColor: 'rgba(28, 63, 170, 0.3)',
      transform: 'scale(1.05)',
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '1.25rem', color: '#4b5563' }}>Loading...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>
        <button 
          onClick={() => navigate('/question-bank')}
          style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Back to Question Banks
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        {success && (
          <div style={styles.successNotification}>
            Changes saved successfully!
          </div>
        )}

        <div style={styles.flexBetween}>
          <div style={styles.flexRow}>
            <BackButton to="/question-bank" />
            <h1 style={{...styles.kbcTitle, ...styles.flexSpace}}>Edit Question Bank</h1>
          </div>
          <div>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  style={styles.button}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{...styles.button, ...styles.greenButton, ...styles.buttonSpace}}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={styles.button}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{...styles.button, ...styles.redButton, ...styles.buttonSpace}}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Delete Bank
                </button>
              </>
            )}
          </div>
        </div>

        {questionBank && (
          <div style={{ marginTop: '2rem' }}>
            <div 
              style={styles.cardContainer}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.hoverCard)}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h2 style={styles.kbcSubTitle}>{questionBank.name}</h2>
              <p style={styles.textGray}>Passcode: {questionBank.passcode}</p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              {questionBank.questions.map((question, index) => (
                <div 
                  key={index} 
                  style={{...styles.cardContainer, marginBottom: '1.5rem'}}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.hoverCard)}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h3 style={styles.questionTitle}>Question {index + 1}</h3>
                  <div>
                    {/* Question Text */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.currentTarget.style, styles.inputFocus)}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                      />
                    ) : (
                      <p style={{...styles.text, ...styles.marginBottom}}>{question.question}</p>
                    )}

                    {/* Image Section */}
                    <div style={styles.marginBottom}>
                      {isEditing ? (
                        <div style={styles.imageContainer}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(index, file);
                            }}
                            style={{ display: 'none' }}
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            style={{...styles.button, padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer'}}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {question.imageUrl ? 'Change Image' : 'Upload Image'}
                          </label>
                          
                          {question.imageUrl && (
                            <>
                              <img
                                src={`${API_URL}${question.imageUrl}`}
                                alt="Question"
                                style={styles.smallImage}
                                onError={(e) => {
                                  console.warn('Error loading image');
                                  e.target.src = defaultQuestionImage; // Fallback image
                                  e.target.onerror = null; // Prevent infinite loop
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                style={styles.removeButton}
                                onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.removeButtonHover)}
                                onMouseOut={(e) => e.currentTarget.style.color = '#EF4444'}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        question.imageUrl && (
                          <div style={styles.flexCenter}>
                            <img
                              src={`${API_URL}${question.imageUrl}`}
                              alt="Question"
                              style={styles.largeImage}
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
                    <div style={window.innerWidth >= 768 ? styles.gridMd : styles.grid}>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                              style={{
                                ...styles.input,
                                borderColor: option === question.correctAnswer ? '#10B981' : 'rgba(28, 63, 170, 0.5)'
                              }}
                              onFocus={(e) => Object.assign(e.currentTarget.style, styles.inputFocus)}
                              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                            />
                          ) : (
                            <div style={option === question.correctAnswer ? styles.correctOptionBox : styles.optionBox}>
                              {option}
                            </div>
                          )}
                          {isEditing && (
                            <input
                              type="radio"
                              name={`correctAnswer-${index}`}
                              checked={option === question.correctAnswer}
                              onChange={() => handleCorrectAnswerChange(index, option)}
                              style={{ marginLeft: '0.5rem' }}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Confirm Delete</h2>
            <p style={styles.modalText}>
              Are you sure you want to delete this question bank? This action cannot be undone.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.button}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{...styles.button, ...styles.redButton}}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
