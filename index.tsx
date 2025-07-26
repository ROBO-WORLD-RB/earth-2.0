
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add error handling for development
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Wrap in try-catch for better error handling
try {
  root.render(<App />);
} catch (error) {
  console.error('Error rendering app:', error);
  root.render(
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Error Loading EARTH AI</h1>
      <p>There was an error loading the application. Please check the console for details.</p>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
}
