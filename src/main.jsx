import './utils/polyfills';  // Add this line at the top
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// In frontend/src/main.jsx
if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
  document.documentElement.classList.add('no-backdrop-filter');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
