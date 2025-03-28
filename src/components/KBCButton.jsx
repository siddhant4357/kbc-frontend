import React from 'react';
import PropTypes from 'prop-types';

export const KBCButton = ({ children, onClick, className = '', ...props }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 bg-kbc-gold text-kbc-dark rounded-md hover:bg-kbc-gold/90 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

KBCButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string
};
