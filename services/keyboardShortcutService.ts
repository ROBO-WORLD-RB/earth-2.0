// Keyboard Shortcut Service for power user features
// Provides customizable keyboard shortcuts and command palette

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: string;
  action: string;
  enabled: boolean;
  customizable: boolean;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  icon: string;
  shortcuts: KeyboardShortcut[];
}

class KeyboardShortcutService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private isEnabled = true;
  private readonly STORAGE_KEY = 'earth-keyboard-shortcuts';

  constructor() {
    this.initializeDefaultShortcuts();
    this.loadCustomShortcuts();
    this.setupGlobalListener();
  }

  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: KeyboardShortcut[] = [
      // Navigation
      {
        id: 'new-chat',
        name: 'New Chat',
        description: 'Start a new conversation',
        keys: ['Ctrl', 'N'],
        category: 'navigation',
        action: 'newChat',
        enabled: true,
        customizable: true
      },
      {
        id: 'toggle-panel',
        name: 'Toggle Side Panel',
        description: 'Show/hide the side panel',
        keys: ['Ctrl', 'B'],
        category: 'navigation',
        action: 'togglePanel',
        enabled: true,
        customizable: true
      },
      {
        id: 'search-conversations',
        name: 'Search Conversations',
        description: 'Open conversation search',
        keys: ['Ctrl', 'F'],
        category: 'navigation',
        action: 'searchConversations',
        enabled: true,
        customizable: true
      },
      {
        id: 'command-palette',
        name: 'Command Palette',
        description: 'Open command palette',
        keys: ['Ctrl', 'Shift', 'P'],
        category: 'navigation',
        action: 'commandPalette',
        enabled: true,
        customizable: true
      },

      // Message Actions
      {
        id: 'send-message',
        name: 'Send Message',
        description: 'Send the current message',
        keys: ['Ctrl', 'Enter'],
        category: 'messaging',
        action: 'sendMessage',
        enabled: true,
        customizable: true
      },
      {
        id: 'new-line',
        name: 'New Line',
        description: 'Insert new line in message',
        keys: ['Shift', 'Enter'],
        category: 'messaging',
        action: 'newLine',
        enabled: true,
        customizable: false
      },
      {
        id: 'clear-input',
        name: 'Clear Input',
        description: 'Clear the message input',
        keys: ['Ctrl', 'K'],
        category: 'messaging',
        action: 'clearInput',
        enabled: true,
        customizable: true
      },
      {
        id: 'upload-file',
        name: 'Upload File',
        description: 'Open file upload dialog',
        keys: ['Ctrl', 'U'],
        category: 'messaging',
        action: 'uploadFile',
        enabled: true,
        customizable: true
      },

      // Voice Controls
      {
        id: 'toggle-voice',
        name: 'Toggle Voice Input',
        description: 'Start/stop voice recording',
        keys: ['Ctrl', 'Shift', 'V'],
        category: 'voice',
        action: 'toggleVoice',
        enabled: true,
        customizable: true
      },
      {
        id: 'read-last-message',
        name: 'Read Last Message',
        description: 'Read the last AI response aloud',
        keys: ['Ctrl', 'Shift', 'R'],
        category: 'voice',
        action: 'readLastMessage',
        enabled: true,
        customizable: true
      },

      // Templates and Productivity
      {
        id: 'show-templates',
        name: 'Show Templates',
        description: 'Open message templates panel',
        keys: ['Ctrl', 'T'],
        category: 'productivity',
        action: 'showTemplates',
        enabled: true,
        customizable: true
      },
      {
        id: 'show-personalities',
        name: 'Show Personalities',
        description: 'Open AI personalities panel',
        keys: ['Ctrl', 'P'],
        category: 'productivity',
        action: 'showPersonalities',
        enabled: true,
        customizable: true
      },
      {
        id: 'export-conversation',
        name: 'Export Conversation',
        description: 'Export current conversation',
        keys: ['Ctrl', 'E'],
        category: 'productivity',
        action: 'exportConversation',
        enabled: true,
        customizable: true
      },

      // UI Controls
      {
        id: 'toggle-theme',
        name: 'Toggle Theme',
        description: 'Switch between light and dark theme',
        keys: ['Ctrl', 'Shift', 'T'],
        category: 'ui',
        action: 'toggleTheme',
        enabled: true,
        customizable: true
      },
      {
        id: 'focus-input',
        name: 'Focus Input',
        description: 'Focus the message input field',
        keys: ['/', '/'],
        category: 'ui',
        action: 'focusInput',
        enabled: true,
        customizable: true
      },
      {
        id: 'scroll-to-bottom',
        name: 'Scroll to Bottom',
        description: 'Scroll to the latest message',
        keys: ['Ctrl', 'End'],
        category: 'ui',
        action: 'scrollToBottom',
        enabled: true,
        customizable: true
      },

      // Advanced
      {
        id: 'regenerate-response',
        name: 'Regenerate Last Response',
        description: 'Regenerate the last AI response',
        keys: ['Ctrl', 'R'],
        category: 'advanced',
        action: 'regenerateResponse',
        enabled: true,
        customizable: true
      },
      {
        id: 'show-analytics',
        name: 'Show Analytics',
        description: 'Open conversation analytics',
        keys: ['Ctrl', 'Shift', 'A'],
        category: 'advanced',
        action: 'showAnalytics',
        enabled: true,
        customizable: true
      },
      {
        id: 'show-shortcuts',
        name: 'Show Shortcuts',
        description: 'Display keyboard shortcuts help',
        keys: ['Ctrl', '?'],
        category: 'help',
        action: 'showShortcuts',
        enabled: true,
        customizable: true
      }
    ];

    defaultShortcuts.forEach(shortcut => {
      this.shortcuts.set(shortcut.id, shortcut);
    });
  }

  private setupGlobalListener(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;

      // Don't trigger shortcuts when typing in input fields (except for specific cases)
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      // Check each shortcut
      for (const shortcut of this.shortcuts.values()) {
        if (!shortcut.enabled) continue;

        if (this.matchesShortcut(event, shortcut)) {
          // Special handling for input-specific shortcuts
          if (shortcut.id === 'send-message' || shortcut.id === 'new-line' || shortcut.id === 'clear-input') {
            if (!isInputField) continue;
          } else if (shortcut.id === 'focus-input') {
            // Focus input can be triggered from anywhere
          } else if (isInputField && !event.ctrlKey && !event.metaKey) {
            // Don't trigger other shortcuts when typing, unless Ctrl/Cmd is held
            continue;
          }

          event.preventDefault();
          event.stopPropagation();
          this.executeShortcut(shortcut.action, event);
          break;
        }
      }
    });
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const pressedKeys = [];
    
    if (event.ctrlKey || event.metaKey) pressedKeys.push('Ctrl');
    if (event.shiftKey) pressedKeys.push('Shift');
    if (event.altKey) pressedKeys.push('Alt');
    
    // Add the main key
    const key = event.key;
    if (key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta') {
      pressedKeys.push(key.toUpperCase());
    }

    // Normalize shortcut keys for comparison
    const normalizedShortcutKeys = shortcut.keys.map(k => 
      k === 'Ctrl' ? 'Ctrl' : k.toUpperCase()
    );

    return pressedKeys.length === normalizedShortcutKeys.length &&
           pressedKeys.every(key => normalizedShortcutKeys.includes(key));
  }

  private executeShortcut(action: string, event: KeyboardEvent): void {
    const listener = this.listeners.get(action);
    if (listener) {
      listener(event);
    } else {
      console.warn(`No listener registered for shortcut action: ${action}`);
    }
  }

  // Public API
  public registerShortcutListener(action: string, callback: (event: KeyboardEvent) => void): void {
    this.listeners.set(action, callback);
  }

  public unregisterShortcutListener(action: string): void {
    this.listeners.delete(action);
  }

  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  public getShortcutsByCategory(): ShortcutCategory[] {
    const categories = new Map<string, ShortcutCategory>();
    
    this.shortcuts.forEach(shortcut => {
      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, {
          id: shortcut.category,
          name: this.getCategoryName(shortcut.category),
          icon: this.getCategoryIcon(shortcut.category),
          shortcuts: []
        });
      }
      categories.get(shortcut.category)!.shortcuts.push(shortcut);
    });

    return Array.from(categories.values()).sort((a, b) => 
      this.getCategoryOrder(a.id) - this.getCategoryOrder(b.id)
    );
  }

  public updateShortcut(id: string, keys: string[]): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut || !shortcut.customizable) return false;

    // Check for conflicts
    const conflict = this.findConflictingShortcut(keys, id);
    if (conflict) {
      throw new Error(`Shortcut conflicts with "${conflict.name}"`);
    }

    shortcut.keys = keys;
    this.saveCustomShortcuts();
    return true;
  }

  public resetShortcut(id: string): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut || !shortcut.customizable) return false;

    // Reset to default (would need to store defaults separately in a real implementation)
    this.initializeDefaultShortcuts();
    this.saveCustomShortcuts();
    return true;
  }

  public toggleShortcut(id: string): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return false;

    shortcut.enabled = !shortcut.enabled;
    this.saveCustomShortcuts();
    return true;
  }

  public findConflictingShortcut(keys: string[], excludeId?: string): KeyboardShortcut | null {
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.id === excludeId || !shortcut.enabled) continue;
      
      if (this.arraysEqual(shortcut.keys, keys)) {
        return shortcut;
      }
    }
    return null;
  }

  public formatShortcut(keys: string[]): string {
    return keys.map(key => {
      switch (key) {
        case 'Ctrl': return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
        case 'Shift': return '⇧';
        case 'Alt': return navigator.platform.includes('Mac') ? '⌥' : 'Alt';
        case 'Enter': return '↵';
        case 'Escape': return 'Esc';
        case ' ': return 'Space';
        default: return key;
      }
    }).join(navigator.platform.includes('Mac') ? '' : '+');
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isShortcutEnabled(): boolean {
    return this.isEnabled;
  }

  // Command palette functionality
  public searchCommands(query: string): KeyboardShortcut[] {
    const lowerQuery = query.toLowerCase();
    return this.getShortcuts()
      .filter(shortcut => 
        shortcut.enabled && (
          shortcut.name.toLowerCase().includes(lowerQuery) ||
          shortcut.description.toLowerCase().includes(lowerQuery) ||
          shortcut.action.toLowerCase().includes(lowerQuery)
        )
      )
      .sort((a, b) => {
        // Prioritize name matches over description matches
        const aNameMatch = a.name.toLowerCase().includes(lowerQuery);
        const bNameMatch = b.name.toLowerCase().includes(lowerQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  public executeCommand(action: string): void {
    const listener = this.listeners.get(action);
    if (listener) {
      listener(new KeyboardEvent('keydown'));
    }
  }

  // Private helpers
  private getCategoryName(categoryId: string): string {
    const names: Record<string, string> = {
      navigation: 'Navigation',
      messaging: 'Messaging',
      voice: 'Voice Controls',
      productivity: 'Productivity',
      ui: 'User Interface',
      advanced: 'Advanced',
      help: 'Help'
    };
    return names[categoryId] || categoryId;
  }

  private getCategoryIcon(categoryId: string): string {
    const icons: Record<string, string> = {
      navigation: '🧭',
      messaging: '💬',
      voice: '🎤',
      productivity: '⚡',
      ui: '🎨',
      advanced: '🔧',
      help: '❓'
    };
    return icons[categoryId] || '📋';
  }

  private getCategoryOrder(categoryId: string): number {
    const order = ['navigation', 'messaging', 'voice', 'productivity', 'ui', 'advanced', 'help'];
    return order.indexOf(categoryId);
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  private saveCustomShortcuts(): void {
    try {
      const customShortcuts = Array.from(this.shortcuts.values())
        .filter(shortcut => shortcut.customizable)
        .map(shortcut => ({
          id: shortcut.id,
          keys: shortcut.keys,
          enabled: shortcut.enabled
        }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customShortcuts));
    } catch (error) {
      console.error('Failed to save custom shortcuts:', error);
    }
  }

  private loadCustomShortcuts(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return;

      const customShortcuts = JSON.parse(saved);
      customShortcuts.forEach((custom: any) => {
        const shortcut = this.shortcuts.get(custom.id);
        if (shortcut && shortcut.customizable) {
          shortcut.keys = custom.keys;
          shortcut.enabled = custom.enabled;
        }
      });
    } catch (error) {
      console.error('Failed to load custom shortcuts:', error);
    }
  }
}

// Create singleton instance
export const keyboardShortcutService = new KeyboardShortcutService();
export default keyboardShortcutService;