import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
//import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* if (typeof window !== "undefined" && "ResizeObserver" in window) {
  const ro = new ResizeObserver(() => {});
  ro.observe(document.body);
  ro.disconnect();
} */

// Patch pour éviter le warning ResizeObserver dans Chrome
if (typeof window !== "undefined" && "ResizeObserver" in window) {
  const resizeObserverErr = window.ResizeObserver;
  window.ResizeObserver = class extends resizeObserverErr {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (err) {
          console.warn("⚠️ ResizeObserver error ignoré :", err);
        }
      });
    }
  };
}



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
