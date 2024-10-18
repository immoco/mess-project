import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import reportWebVitals from './reportWebVitals';
import '@fortawesome/fontawesome-free/css/all.min.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service_worker.js')
      .then(registration => {
        console.log('Service Worker registered', registration);
      })
      .catch(err => {
        console.error('Service Worker registration failed:', err);
      });
  });
}


ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
