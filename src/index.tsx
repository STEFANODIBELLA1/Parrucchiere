import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assicurati che il percorso sia corretto
import './index.css'; // O il tuo file CSS globale se ne hai uno

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);