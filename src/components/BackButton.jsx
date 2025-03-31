import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to = '/' }) => {
  const navigate = useNavigate();
  
  // Define color styles based on the ones in EditQuestionBank
  const colors = {
    darkBlue: '#000B3E',
    blue: '#0B1D78',
    lightBlue: '#1C3FAA',
    gold: '#FFB800',
  };

  return (
    <button 
      onClick={() => navigate(to)} 
      className="back-button" 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.blue}, ${colors.darkBlue})`,
        color: colors.gold,
        border: `1px solid ${colors.gold}`,
        borderRadius: '50%',
        width: '2.5rem',
        height: '2.5rem',
        fontSize: '1.25rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 0 10px rgba(255, 184, 0, 0.2)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 184, 0, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 184, 0, 0.2)';
      }}
    >
      ←
    </button>
  );
};

export default BackButton;