import React from 'react';

interface FeatureToolbarProps {
  onShowPersonalities: () => void;
  onShowAnalytics: () => void;
  onShowExportImport: () => void;
  onShowKeyboardHelp: () => void;
  onShowCommandPalette: () => void;
  onShowSearch: () => void;
  onShowTemplates: () => void;
  onShowVoiceSettings: () => void;
}

const FeatureToolbar: React.FC<FeatureToolbarProps> = ({
  onShowPersonalities,
  onShowAnalytics,
  onShowExportImport,
  onShowKeyboardHelp,
  onShowCommandPalette,
  onShowSearch,
  onShowTemplates,
  onShowVoiceSettings
}) => {
  const features = [
    {
      id: 'personalities',
      name: 'Personalities',
      icon: '🧠',
      onClick: onShowPersonalities,
      description: 'Manage AI personalities',
      shortcut: 'Ctrl+P'
    },
    {
      id: 'search',
      name: 'Search',
      icon: '🔍',
      onClick: onShowSearch,
      description: 'Search conversations',
      shortcut: 'Ctrl+F'
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: '📝',
      onClick: onShowTemplates,
      description: 'Message templates',
      shortcut: 'Ctrl+T'
    },
    {
      id: 'voice',
      name: 'Voice',
      icon: '🎤',
      onClick: onShowVoiceSettings,
      description: 'Voice settings',
      shortcut: 'Ctrl+Shift+V'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      onClick: onShowAnalytics,
      description: 'Usage analytics',
      shortcut: 'Ctrl+Shift+A'
    },
    {
      id: 'backup',
      name: 'Backup',
      icon: '📦',
      onClick: onShowExportImport,
      description: 'Export & Import',
      shortcut: 'Ctrl+E'
    },
    {
      id: 'shortcuts',
      name: 'Shortcuts',
      icon: '⌨️',
      onClick: onShowKeyboardHelp,
      description: 'Keyboard shortcuts',
      shortcut: 'Ctrl+?'
    },
    {
      id: 'command',
      name: 'Commands',
      icon: '⚡',
      onClick: onShowCommandPalette,
      description: 'Command palette',
      shortcut: 'Ctrl+Shift+P'
    }
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-1">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={feature.onClick}
              className="group relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={`${feature.description} (${feature.shortcut})`}
            >
              <span className="text-base">{feature.icon}</span>
              <span className="hidden sm:inline">{feature.name}</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {feature.description}
                <br />
                <span className="text-gray-400 dark:text-gray-600">{feature.shortcut}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureToolbar;