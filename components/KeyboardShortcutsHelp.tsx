import React, { useState, useEffect } from 'react';
import { keyboardShortcutService, KeyboardShortcut, ShortcutCategory } from '../services/keyboardShortcutService';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose
}) => {
  const [categories, setCategories] = useState<ShortcutCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShortcuts();
    }
  }, [isOpen]);

  const loadShortcuts = () => {
    setCategories(keyboardShortcutService.getShortcutsByCategory());
  };

  const filteredShortcuts = () => {
    let allShortcuts: KeyboardShortcut[] = [];
    
    if (selectedCategory === 'all') {
      allShortcuts = categories.flatMap(cat => cat.shortcuts);
    } else {
      const category = categories.find(cat => cat.id === selectedCategory);
      allShortcuts = category ? category.shortcuts : [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allShortcuts = allShortcuts.filter(shortcut =>
        shortcut.name.toLowerCase().includes(query) ||
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.keys.some(key => key.toLowerCase().includes(query))
      );
    }

    return allShortcuts;
  };

  const handleToggleShortcut = (shortcutId: string) => {
    keyboardShortcutService.toggleShortcut(shortcutId);
    loadShortcuts();
  };

  const handleEditShortcut = (shortcutId: string) => {
    const shortcut = categories
      .flatMap(cat => cat.shortcuts)
      .find(s => s.id === shortcutId);
    
    if (shortcut && shortcut.customizable) {
      setEditingShortcut(shortcutId);
      setNewKeys([...shortcut.keys]);
      setIsRecording(false);
    }
  };

  const handleSaveShortcut = () => {
    if (!editingShortcut || newKeys.length === 0) return;

    try {
      keyboardShortcutService.updateShortcut(editingShortcut, newKeys);
      setEditingShortcut(null);
      setNewKeys([]);
      loadShortcuts();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update shortcut');
    }
  };

  const handleCancelEdit = () => {
    setEditingShortcut(null);
    setNewKeys([]);
    setIsRecording(false);
  };

  const handleResetShortcut = (shortcutId: string) => {
    if (confirm('Reset this shortcut to its default keys?')) {
      keyboardShortcutService.resetShortcut(shortcutId);
      loadShortcuts();
    }
  };

  const handleKeyRecord = (e: React.KeyboardEvent) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];
    if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');

    const key = e.key;
    if (key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta') {
      keys.push(key.toUpperCase());
    }

    if (keys.length > 0) {
      setNewKeys(keys);
      setIsRecording(false);
    }
  };

  const getCategoryColor = (categoryId: string): string => {
    const colors: Record<string, string> = {
      navigation: 'text-blue-600 dark:text-blue-400',
      messaging: 'text-green-600 dark:text-green-400',
      voice: 'text-purple-600 dark:text-purple-400',
      productivity: 'text-orange-600 dark:text-orange-400',
      ui: 'text-pink-600 dark:text-pink-400',
      advanced: 'text-red-600 dark:text-red-400',
      help: 'text-gray-600 dark:text-gray-400'
    };
    return colors[categoryId] || colors.help;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              ⌨️ Keyboard Shortcuts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Customize and manage your keyboard shortcuts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                📋 All Shortcuts
              </button>

              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.icon} {category.name} ({category.shortcuts.length})
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredShortcuts().length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>No shortcuts found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredShortcuts().map(shortcut => (
                  <div
                    key={shortcut.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shortcut.enabled}
                            onChange={() => handleToggleShortcut(shortcut.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className={`text-lg ${getCategoryColor(shortcut.category)}`}>
                            {categories.find(c => c.id === shortcut.category)?.icon || '📋'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {shortcut.name}
                            </h4>
                            {!shortcut.customizable && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                                Fixed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shortcut.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {editingShortcut === shortcut.id ? (
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-3 py-2 border-2 border-dashed rounded cursor-pointer transition-colors ${
                                isRecording
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                              }`}
                              onClick={() => setIsRecording(true)}
                              onKeyDown={handleKeyRecord}
                              tabIndex={0}
                            >
                              {isRecording ? (
                                <span className="text-purple-600 dark:text-purple-400 text-sm">
                                  Press keys...
                                </span>
                              ) : newKeys.length > 0 ? (
                                <kbd className="text-sm font-mono">
                                  {keyboardShortcutService.formatShortcut(newKeys)}
                                </kbd>
                              ) : (
                                <span className="text-gray-500 text-sm">Click to record</span>
                              )}
                            </div>
                            <button
                              onClick={handleSaveShortcut}
                              disabled={newKeys.length === 0}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <kbd className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded border font-mono">
                              {keyboardShortcutService.formatShortcut(shortcut.keys)}
                            </kbd>
                            {shortcut.customizable && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditShortcut(shortcut.id)}
                                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  title="Edit shortcut"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleResetShortcut(shortcut.id)}
                                  className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                  title="Reset to default"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 Tip: Use Ctrl+Shift+P to open the command palette</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {filteredShortcuts().filter(s => s.enabled).length} enabled
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                {filteredShortcuts().filter(s => !s.enabled).length} disabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;