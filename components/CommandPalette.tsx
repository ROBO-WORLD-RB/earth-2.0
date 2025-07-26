import React, { useState, useEffect, useRef } from 'react';
import { keyboardShortcutService, KeyboardShortcut } from '../services/keyboardShortcutService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (action: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onExecuteCommand
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<KeyboardShortcut[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setCommands(keyboardShortcutService.getShortcuts().filter(s => s.enabled));
      
      // Focus input after a brief delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = keyboardShortcutService.searchCommands(query);
      setCommands(searchResults);
      setSelectedIndex(0);
    } else {
      setCommands(keyboardShortcutService.getShortcuts().filter(s => s.enabled));
      setSelectedIndex(0);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, commands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (commands[selectedIndex]) {
          executeCommand(commands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const executeCommand = (command: KeyboardShortcut) => {
    onExecuteCommand(command.action);
    onClose();
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      navigation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      messaging: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      voice: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      productivity: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      ui: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      help: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category] || colors.help;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      navigation: '🧭',
      messaging: '💬',
      voice: '🎤',
      productivity: '⚡',
      ui: '🎨',
      advanced: '🔧',
      help: '❓'
    };
    return icons[category] || '📋';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto">
          {commands.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {commands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-purple-50 dark:bg-purple-900/20 border-r-2 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{getCategoryIcon(command.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {command.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(command.category)}`}>
                            {command.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {command.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded border">
                        {keyboardShortcutService.formatShortcut(command.keys)}
                      </kbd>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">↵</kbd>
                Execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd>
                Close
              </span>
            </div>
            <span>{commands.length} command{commands.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;