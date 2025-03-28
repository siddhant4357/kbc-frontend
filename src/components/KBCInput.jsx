import React from 'react';
import PropTypes from 'prop-types';

export const KBCInput = ({ label, className = '', ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-kbc-gold text-sm font-medium">{label}</label>}
    <input 
      className={`w-full px-3 py-2 bg-kbc-darker border border-kbc-gold/30 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-kbc-gold text-white ${className}`}
      {...props} 
    />
  </div>
);

KBCInput.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string
};
