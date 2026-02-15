import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';
import './styles/globals.css';

// Render the app
console.log('🚀 [Main] App initializing...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);