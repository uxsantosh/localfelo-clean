import ReactDOM from 'react-dom/client';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../styles/globals.css';

// Render the app
console.log('🚀 [Main] App initializing...');
console.log('🔍 [Main] App component:', App);
console.log('🔍 [Main] ErrorBoundary component:', ErrorBoundary);
console.log('🔍 [Main] Root element:', document.getElementById('root'));

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

console.log('✅ [Main] App rendered successfully');
