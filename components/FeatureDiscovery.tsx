import React, { useState } from 'react';

interface FeatureDiscoveryProps {
  onClose: () => void;
  onShowPersonalities: () => void;
  onShowCommandPalette: () => void;
}

const FeatureDiscovery: React.FC<FeatureDiscoveryProps> = ({
  onClose,
  onShowPersonalities,
  onShowCommandPalette
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      title: '🧠 AI Personality Manager',
      description: 'Create and switch between different AI personalities for various tasks',
      action: 'Try Personalities',
      onAction: onShowPersonalities,
      hasAction: true,
      highlight: 'Create custom AI assistants for coding, writing, learning, and more!'
    },
    {
      title: '⚡ Command Palette',
      description: 'Quick access to all features with keyboard shortcuts',
      action: 'Open Commands',
      onAction: onShowCommandPalette,
      hasAction: true,
      highlight: 'Press Ctrl+Shift+P anytime for instant access to any feature!'
    },
    {
      title: '🔍 Smart Search',
      description: 'Search across all your conversations with advanced filters',
      action: 'Got it!',
      onAction: () => {},
      hasAction: false,
      highlight: 'Press Ctrl+F to search your conversation history instantly!'
    },
    {
      title: '📝 Message Templates',
      description: 'Save and reuse common message patterns with variables',
      action: 'Got it!',
      onAction: () => {},
      hasAction: false,
      highlight: 'Press Ctrl+T to access pre-built templates for coding, writing, and more!'
    },
    {
      title: '🎤 Voice Integration',
      description: 'Use voice commands and text-to-speech for hands-free interaction',
      action: 'Got it!',
      onAction: () => {},
      hasAction: false,
      highlight: 'Click the microphone button or use Ctrl+Shift+V for voice features!'
    },
    {
      title: '📊 Analytics & Insights',
      description: 'Track your usage patterns and conversation statistics',
      action: 'Got it!',
      onAction: () => {},
      hasAction: false,
      highlight: 'View detailed analytics about your AI interactions and productivity!'
    }
  ];

  const currentFeature = features[currentStep];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleAction = () => {
    currentFeature.onAction();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              🌟 Discover New Features
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {currentStep + 1} of {features.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{currentFeature.title.split(' ')[0]}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {currentFeature.title.substring(2)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentFeature.description}
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-purple-800 dark:text-purple-200 font-medium">
                💡 {currentFeature.highlight}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / features.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / features.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Skip Tour
            </button>
          </div>

          <div className="flex gap-2">
            {currentFeature.hasAction && (
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {currentFeature.action}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg transition-colors"
            >
              {currentStep === features.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDiscovery;