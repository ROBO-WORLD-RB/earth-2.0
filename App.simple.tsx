import React, { useState, useEffect } from 'react';

const SimpleApp: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500">
              <circle cx="50" cy="50" r="40" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-purple-600">EARTH</h1>
          <p className="text-gray-600 mt-2">Loading AI Brain Studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex flex-col h-full">
        <header className="bg-purple-600 text-white p-4">
          <h1 className="text-2xl font-bold">EARTH AI Brain Studio</h1>
        </header>
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mb-6 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500">
                <circle cx="50" cy="50" r="40" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to EARTH</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your AI Brain Studio is ready to use!
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">🧠 AI Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Intelligent conversations with customizable personalities
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">🎤 Voice Controls</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Speak naturally with voice commands and responses
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">📁 File Processing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload and analyze documents, images, and more
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleApp;