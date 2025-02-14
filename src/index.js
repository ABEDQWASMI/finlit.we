import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Widget initialization function
const init = (selector) => {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`FinLit Widget: Container ${selector} not found`);
    return;
  }
  
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    container
  );
};

// Export the widget API
export { init };

// Also expose it on window for non-module environments
if (typeof window !== 'undefined') {
  window.FinLitWidget = { init };
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
