import React, { useState, useEffect } from 'react';
import { exampleInstructions } from '../data/exampleInstructions';
import ModalPortal from './ModalPortal';
import ModalWrapper from './ModalWrapper';

interface QuickStartGuideProps {
  onSelect: (instruction: string) => void;
  onClose: () => void;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onSelect, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedExample, setSelectedExample] = useState(exampleInstructions[0]);
  
  console.log('QuickStartGuide rendered, activeStep:', activeStep, 'selectedExample:', selectedExample.title);

  const handleNext = () => {
    console.log('Next button clicked, current step:', activeStep);
    if (activeStep < 3) {
      console.log('Moving to step:', activeStep + 1);
      setActiveStep(activeStep + 1);
    } else {
      console.log('Completing onboarding with instruction:', selectedExample.instruction);
      onSelect(selectedExample.instruction);
    }
  };

  const handleBack = () => {
    console.log('Back button clicked, current step:', activeStep);
    if (activeStep > 1) {
      console.log('Moving to step:', activeStep - 1);
      setActiveStep(activeStep - 1);
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft' && activeStep > 1) {
        event.preventDefault();
        handleBack();
      } else if (event.key === 'ArrowRight' && activeStep < 3) {
        event.preventDefault();
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeStep]);

  return (
    <ModalPortal>
      <ModalWrapper onClose={onClose} maxWidth="3xl">
        <div className="flex flex-col h-full max-h-[90vh] min-h-[600px]">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Quick Start Guide
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mt-6 space-x-4">
              <div className="flex items-center">
                <button
                  onClick={() => setActiveStep(1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 ${
                    activeStep >= 1 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${activeStep === 1 ? 'ring-4 ring-purple-200 dark:ring-purple-800' : ''}`}
                  type="button"
                >
                  1
                </button>
                <div className={`h-2 w-16 mx-2 rounded-full transition-all duration-300 ${
                  activeStep > 1 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setActiveStep(2)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 ${
                    activeStep >= 2 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${activeStep === 2 ? 'ring-4 ring-purple-200 dark:ring-purple-800' : ''}`}
                  type="button"
                >
                  2
                </button>
                <div className={`h-2 w-16 mx-2 rounded-full transition-all duration-300 ${
                  activeStep > 2 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setActiveStep(3)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 ${
                    activeStep >= 3 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${activeStep === 3 ? 'ring-4 ring-purple-200 dark:ring-purple-800' : ''}`}
                  type="button"
                >
                  3
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0 relative">
          {activeStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Welcome to EARTH AI Brain Studio!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This guide will help you get started with creating your first AI brain. The AI brain is defined by system instructions that tell the AI how to behave and respond.
              </p>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800 mb-6">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">What are System Instructions?</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  System instructions define the AI's personality, expertise, and behavior. Think of it as setting up the AI's "brain" before you start chatting.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Easy to Use</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      You can choose from pre-made templates or create your own custom AI brain.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Customizable</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Adjust the AI's expertise, tone, and behavior to suit your specific needs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Powerful</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      The right instructions can dramatically improve the quality and relevance of AI responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Choose a Starting Point
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select one of these example AI brains to get started quickly. You can always customize it later.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {exampleInstructions.slice(0, 6).map((example) => (
                  <div
                    key={example.title}
                    onClick={() => setSelectedExample(example)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedExample.title === example.title
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {example.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {example.instruction.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Selected: {selectedExample.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                  {selectedExample.instruction}
                </p>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Ready to Start!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You've selected the <strong>{selectedExample.title}</strong> brain. Here's what you can do next:
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-4 text-green-600 dark:text-green-400">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Start Chatting</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Begin a conversation with your AI brain and see how it responds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-4 text-green-600 dark:text-green-400">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Customize Further</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Edit the instructions anytime to refine the AI's behavior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-4 text-green-600 dark:text-green-400">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Create Multiple Brains</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create different AI brains for different purposes by starting new chats.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Pro Tip</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  You can always access templates, the personality builder, and help guides from the side panel.
                </p>
              </div>
            </div>
          )}

          {/* Floating Next Button - Always visible */}
          {activeStep < 3 && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleNext}
                className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center"
                type="button"
                title="Next Step"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center bg-white dark:bg-gray-800 relative z-10">
            <button
              onClick={handleBack}
              disabled={activeStep === 1}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              type="button"
            >
              ← Back
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {activeStep} of 3
              </span>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 cursor-pointer font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                type="button"
              >
                <span>{activeStep === 3 ? 'Get Started' : 'Next'}</span>
                {activeStep < 3 && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </ModalWrapper>
    </ModalPortal>
  );
};

export default QuickStartGuide;