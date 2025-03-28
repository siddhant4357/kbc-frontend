import React from 'react';
import PropTypes from 'prop-types';

export const KBCCard = ({ children, className = '' }) => (
  <div className={`rounded-lg bg-kbc-dark p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

KBCCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
