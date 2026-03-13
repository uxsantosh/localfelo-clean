import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/globals.css';

// Render the app
console.log('🚀 [Main] App initializing...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(<App />);

console.log('✅ [Main] App rendered successfully');
