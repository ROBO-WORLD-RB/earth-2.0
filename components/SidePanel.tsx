
import React, { useState, useEffect } from 'react';
import { Conversation } from '../types';
import SaveIcon from './icons/SaveIcon';
import ClearIcon from './icons/ClearIcon';
import ThemeToggleButton from './ThemeToggleButton';
import EarthIcon from './icons/EarthIcon';
import NewChatIcon from './icons/NewChatIcon';
import InstallIcon from './icons/InstallIcon';
import { usePWA } from '../services/pwaService';
import InstructionHelp from './InstructionHelp';
// Note: QuickStartGuide and personality management have been moved to Brain Gallery

interface SidePanelProps {
  isVisible: boolean;
  initialInstruction: string;
  onSave: (instruction: string) => void;
  onClear: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  conversations: Conversation[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowPersonalities?: () => void;
  onShowAnalytics?: () => void;
  onShowExportImport?: () => void;
  onShowKeyboardHelp?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  isVisible, 
  initialInstruction, 
  onSave, 
  onClear, 
  saveStatus, 
  conversations, 
  activeChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  theme, 
  onToggleTheme,
  onShowPersonalities,
  onShowAnalytics,
  onShowExportImport,
  onShowKeyboardHelp
}) => {
  const [instruction, setInstruction] = useState(initialInstruction);
  const { canInstall, isInstalled, showInstallPrompt } = usePWA();
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

  useEffect(() => {
    setInstruction(initialInstruction);
  }, [initialInstruction]);

  const handleSave = () => {
    onSave(instruction);
  };
  
  // Brain Gallery functionality has replaced the save personality feature
  
  const handleClear = () => {
    setInstruction('');
    onClear();
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (canInstall) {
      try {
        await showInstallPrompt();
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
    }
  };
  
  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return <span className="text-yellow-600 dark:text-yellow-400">Applying...</span>;
      case 'saved':
        return <span className="text-green-600 dark:text-green-400">Brain settings applied!</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed top-0 left-0 w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col p-6 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <EarthIcon className="w-10 h-10 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              EARTH
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 -mt-1">AI Brain Studio</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
          Define the AI's personality, then review your conversation.
        </p>
        
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">System Instruction</h2>
        <div className="relative">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., You are a witty pirate captain..."
            className="w-full h-32 mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none transition-colors"
          />
          <button
            onClick={() => setShowHelp(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Get help with instructions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex flex-col space-y-2">
          <div className="h-5 text-sm text-center font-medium">
            {getStatusMessage()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="flex-1 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <SaveIcon />
              Apply Brain
            </button>
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
            >
              <ClearIcon />
              Reset
            </button>
          </div>
          
          {/* Template functionality has been moved to Brain Gallery */}
        </div>
        <div className="border-t my-6 border-gray-200 dark:border-gray-700"></div>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Chat History</h2>
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <NewChatIcon />
            New Chat
          </button>
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-3">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                className={`group flex items-center justify-between p-3 rounded-lg transition-colors text-sm font-medium truncate ${
                  conv.id === activeChatId 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <button 
                  onClick={() => onSelectChat(conv.id)}
                  className="flex-1 text-left truncate"
                >
                  {conv.title}
                </button>
                {onDeleteChat && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    title="Delete conversation"
                  >
                    <svg 
                      className="w-4 h-4 text-red-500 dark:text-red-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500 pt-8">
              <p>No conversation history yet.</p>
              <p className="text-xs mt-1">Start a new chat to begin.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Feature Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {onShowPersonalities && (
            <button
              onClick={onShowPersonalities}
              className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-200 transition-colors"
              title="Manage AI Personalities"
            >
              <span>🧠</span>
              Personalities
            </button>
          )}
          {onShowAnalytics && (
            <button
              onClick={onShowAnalytics}
              className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 transition-colors"
              title="View Analytics"
            >
              <span>📊</span>
              Analytics
            </button>
          )}
          {onShowExportImport && (
            <button
              onClick={onShowExportImport}
              className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 transition-colors"
              title="Export & Import"
            >
              <span>📦</span>
              Backup
            </button>
          )}
          {onShowKeyboardHelp && (
            <button
              onClick={onShowKeyboardHelp}
              className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
              title="Keyboard Shortcuts"
            >
              <span>⌨️</span>
              Shortcuts
            </button>
          )}
        </div>

        <div className="flex justify-between items-center">
          <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
          
          {/* Install Button - Only show if not installed and can be installed or is iOS */}
          {!isInstalled && (canInstall || isIOS) && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-colors"
            >
              <InstallIcon className="w-4 h-4" />
              Install App
            </button>
          )}
        </div>
      </div>

      {/* iOS Install Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Install on iOS
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To install EARTH AI on your iOS device:
            </p>
            
            <ol className="list-decimal pl-5 mb-6 text-gray-600 dark:text-gray-300 space-y-3">
              <li>
                Tap the <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                  Share
                </span> button in Safari
              </li>
              <li>
                Scroll down and tap <span className="font-medium">Add to Home Screen</span>
                <div className="mt-1 bg-gray-100 dark:bg-gray-700 rounded p-2 text-xs">
                  <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add to Home Screen
                </div>
              </li>
              <li>Tap <span className="font-medium">Add</span> in the top right corner</li>
            </ol>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Instruction Help Modal */}
      {showHelp && (
        <InstructionHelp onClose={() => setShowHelp(false)} />
      )}
      
      {/* Quick Start Guide has been moved to Brain Gallery */}
    </div>
  );
};

export default SidePanel;
