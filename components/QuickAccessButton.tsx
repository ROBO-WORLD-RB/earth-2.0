import React, { useState } from 'react';

interface QuickAccessButtonProps {
  onShowCommandPalette: () => void;
  onShowPersonalities: () => void;
  onShowSearch: () => void;
  onShowTemplates: () => void;
}

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({
  onShowCommandPalette,
  onShowPersonalities,
  onShowSearch,
  onShowTemplates
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      id: 'command',
      name: 'Command Palette',
      icon: '⚡',
      onClick: () => {
        onShowCommandPalette();
        setIsOpen(false);
      },
      shortcut: 'Ctrl+Shift+P'
    },
    {
      id: 'personalities',
      name: 'AI Personalities',
      icon: '🧠',
      onClick: () => {
        onShowPersonalities();
        setIsOpen(false);
      },
      shortcut: 'Ctrl+P'
    },
    {
      id: 'search',
      name: 'Search',
      icon: '🔍',
      onClick: () => {
        onShowSearch();
        setIsOpen(false);
      },
      shortcut: 'Ctrl+F'
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: '📝',
      onClick: () => {
        onShowTemplates();
        setIsOpen(false);
      },
      shortcut: 'Ctrl+T'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick action menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 min-w-48">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <span className="text-base">{action.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{action.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{action.shortcut}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Quick Actions (Ctrl+Shift+P)"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default QuickAccessButton;