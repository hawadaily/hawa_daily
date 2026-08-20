import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { JobsProvider } from './context/JobsContext';
import './index.css';

// Set appropriate manifest based on current path
const setManifest = () => {
  const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  if (link) {
    if (window.location.pathname.startsWith('/admin')) {
      link.href = '/admin-manifest.json';
    } else {
      link.href = '/manifest.json';
    }
  }
};

setManifest();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <JobsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </JobsProvider>
    </HelmetProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.update();
    }).catch(console.error);
  });
}
