import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@google/genai';
import { User } from 'firebase/auth';
import { Message, Conversation, FileMessage } from './types';
import { createChat, generateTitle } from './services/geminiService';
import { fileStorage } from './services/fileStorage';
import { onAuthStateChange } from './services/authService';
import { personalityService } from './services/personalityService';
import { personalityTemplates } from './data/personalityTemplates';
import { voiceService } from './services/voiceService';
import { searchService } from './services/searchService';
import { templateService, MessageTemplate } from './services/templateService';
import ChatPanel from './components/ChatPanel';
import SidePanel from './components/SidePanel';
import PanelToggleButton from './components/PanelToggleButton';
import EarthIcon from './components/icons/EarthIcon';
import AuthPage from './components/AuthPage';
import UserProfile from './components/UserProfile';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import InstallButton from './components/InstallButton';
import PWAStatusToggle from './components/PWAStatusToggle';
import QuickStartGuide from './components/QuickStartGuide';
import VoiceSettings from './components/VoiceSettings';
import SearchPanel from './components/SearchPanel';
import TemplatePanel from './components/TemplatePanel';
import PersonalityManager from './components/PersonalityManager';
import ConversationAnalytics from './components/ConversationAnalytics';
import ExportImportPanel from './components/ExportImportPanel';
import CommandPalette from './components/CommandPalette';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import FeatureToolbar from './components/FeatureToolbar';
import QuickAccessButton from './components/QuickAccessButton';
import FeatureDiscovery from './components/FeatureDiscovery';
import FeatureNotification from './components/FeatureNotification';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { keyboardShortcutService } from './services/keyboardShortcutService';
import { exportImportService } from './services/exportImportService';
import { analytics, trackFeatureUsage, trackError } from './utils/analytics';
import { performanceMonitor } from './utils/performance';


const DEFAULT_INSTRUCTION = "You are a helpful and friendly AI assistant named EARTH. Provide clear and concise answers.";

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // App state
  const [systemInstruction, setSystemInstruction] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileMessage[]>([]);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('earth-theme') as Theme) || 'light';
    } catch {
      return 'light';
    }
  });
  const [resetFilesTrigger, setResetFilesTrigger] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showPersonalityManager, setShowPersonalityManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(false);
  const [showFeatureNotification, setShowFeatureNotification] = useState(false);

  const hideTimeoutRef = useRef<number | null>(null);

  // Auth effect
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const timeout = setTimeout(() => {
      console.log('Auth loading timeout reached, setting authLoading to false');
      setAuthLoading(false);
      
      const mockUser = {
        uid: 'mock-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve('mock-token'),
        getIdTokenResult: () => Promise.resolve({ token: 'mock-token', claims: {}, signInProvider: 'password', expirationTime: '', issuedAtTime: '', authTime: '' }),
        reload: () => Promise.resolve(),
        toJSON: () => ({})
      };
      
      setUser(mockUser as any);
    }, 2000);
    
    try {
      const unsubscribe = onAuthStateChange((currentUser) => {
        console.log('Auth state changed:', currentUser ? 'User logged in' : 'No user');
        clearTimeout(timeout);
        setUser(currentUser);
        setAuthLoading(false);
      });
      
      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      clearTimeout(timeout);
      setAuthLoading(false);
      
      const mockUser = {
        uid: 'mock-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve('mock-token'),
        getIdTokenResult: () => Promise.resolve({ token: 'mock-token', claims: {}, signInProvider: 'password', expirationTime: '', issuedAtTime: '', authTime: '' }),
        reload: () => Promise.resolve(),
        toJSON: () => ({})
      };
      
      setUser(mockUser as any);
    }
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('earth-theme', theme);
    } catch (e) {
      console.error("Failed to save theme preference:", e);
    }
  }, [theme]);

  // Initialization effect
  useEffect(() => {
    if (!user) return;
    
    try {
      const userPrefix = `earth-${user.uid}-`;
      const savedInstruction = localStorage.getItem(`${userPrefix}system-instruction`);
      const savedConversations = localStorage.getItem(`${userPrefix}conversations`);
      const savedActiveChatId = localStorage.getItem(`${userPrefix}active-chat-id`);

      setSystemInstruction(savedInstruction || DEFAULT_INSTRUCTION);

      const parsedConversations: Conversation[] = savedConversations ? JSON.parse(savedConversations) : [];

      if (parsedConversations.length > 0) {
        setConversations(parsedConversations);
        setActiveChatId(savedActiveChatId || parsedConversations[0].id);
        
        // Build search index for existing conversations
        searchService.buildSearchIndex(parsedConversations);
      } else {
        const newId = Date.now().toString();
        const firstConversation: Conversation = { id: newId, title: 'New Chat', messages: [] };
        setConversations([firstConversation]);
        setActiveChatId(newId);
        
        const hasSeenQuickStart = localStorage.getItem(`${userPrefix}seen-quick-start`);
        const hasSeenFeatureDiscovery = localStorage.getItem(`${userPrefix}seen-feature-discovery`);
        if (!hasSeenQuickStart) {
          setShowQuickStart(true);
        } else if (!hasSeenFeatureDiscovery) {
          setShowFeatureDiscovery(true);
        }
      }
      
      const userPreferences = personalityService.getUserPreferences();
      setHasCompletedOnboarding(userPreferences.hasCompletedOnboarding);
      
      // Show feature notification for existing users
      const hasSeenNotification = localStorage.getItem(`${userPrefix}seen-feature-notification`);
      if (!hasSeenNotification && parsedConversations.length > 0) {
        setTimeout(() => setShowFeatureNotification(true), 2000);
      }
      
    } catch (e) {
      console.error("Could not read from localStorage, initializing fresh state.", e);
      setSystemInstruction(DEFAULT_INSTRUCTION);
      const newId = Date.now().toString();
      const firstConversation: Conversation = { id: newId, title: 'New Chat', messages: [] };
      setConversations([firstConversation]);
      setActiveChatId(newId);
    }
    setIsInitialized(true);
  }, [user]);

  // Persistence effect
  useEffect(() => {
    if (isInitialized && user) {
      try {
        const userPrefix = `earth-${user.uid}-`;
        localStorage.setItem(`${userPrefix}conversations`, JSON.stringify(conversations));
        if (activeChatId) {
          localStorage.setItem(`${userPrefix}active-chat-id`, activeChatId);
        }
        
        // Update search index when conversations change
        searchService.buildSearchIndex(conversations);
      } catch (e) {
        console.error("Failed to save conversations to localStorage:", e);
      }
    }
  }, [conversations, activeChatId, isInitialized, user]);
  
  // Chat creation effect
  useEffect(() => {
    if (isInitialized && systemInstruction && activeChatId) {
      try {
        const activeConversation = conversations.find(c => c.id === activeChatId);
        const history = activeConversation ? activeConversation.messages : [];
        const newChat = createChat(systemInstruction, history);
        setChat(newChat);
      } catch (error) {
        console.error("Failed to initialize Gemini chat:", error);
        alert("Failed to initialize AI. Please check your API Key and refresh.");
      }
    }
  }, [systemInstruction, activeChatId, isInitialized, conversations]);

  // Callbacks
  const handleToggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newConversation: Conversation = { id: newId, title: 'New Chat', messages: [] };
    setConversations(prev => [newConversation, ...prev]);
    setActiveChatId(newId);
    setAttachedFiles([]);
    setIsPanelVisible(false);
    
    // Track analytics
    trackFeatureUsage('chat', 'new_conversation');
  }, []);

  const handleSelectChat = useCallback(async (id: string) => {
    if (id !== activeChatId) {
      setActiveChatId(id);
      try {
        const files = await fileStorage.getFilesByConversation(id);
        setAttachedFiles(files);
      } catch (error) {
        console.error('Error loading conversation files:', error);
        setAttachedFiles([]);
      }
    }
    setIsPanelVisible(false);
  }, [activeChatId]);

  const handleDeleteChat = useCallback(async (id: string) => {
    try {
      await fileStorage.deleteFilesByConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (id === activeChatId) {
        const remainingConversations = conversations.filter(c => c.id !== id);
        if (remainingConversations.length > 0) {
          setActiveChatId(remainingConversations[0].id);
          const files = await fileStorage.getFilesByConversation(remainingConversations[0].id);
          setAttachedFiles(files);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [activeChatId, conversations, handleNewChat]);

  const handleSaveSettings = useCallback((newInstruction: string) => {
    setSaveStatus('saving');
    try {
      if (user) {
        const userPrefix = `earth-${user.uid}-`;
        localStorage.setItem(`${userPrefix}system-instruction`, newInstruction);
        setSystemInstruction(newInstruction);
        handleNewChat();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (e) {
      console.error("Failed to save to localStorage.");
      setSaveStatus('idle');
    }
  }, [handleNewChat, user]);
  
  const handleClearSettings = useCallback(() => {
    handleSaveSettings(DEFAULT_INSTRUCTION);
  }, [handleSaveSettings]);

  // Voice command handler
  const handleVoiceCommand = useCallback((command: string, action: string, params?: any) => {
    switch (action) {
      case 'newChat':
        handleNewChat();
        break;
      case 'setTheme':
        setTheme(params);
        break;
      case 'stopListening':
        // Voice service will handle this automatically
        break;
      case 'readLastMessage':
        const currentMessages = conversations.find(c => c.id === activeChatId)?.messages || [];
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          voiceService.speak(lastMessage.content);
        }
        break;
      default:
        console.log('Unknown voice command:', action);
    }
  }, [handleNewChat, conversations, activeChatId]);

  // Template selection handler
  const handleTemplateSelect = useCallback((template: MessageTemplate, variables: Record<string, string>) => {
    const processedContent = templateService.processTemplate(template, variables);
    // This will be passed to ChatPanel to populate the input
    return processedContent;
  }, []);

  // Search conversation selection
  const handleSearchConversationSelect = useCallback((conversationId: string, messageIndex?: number) => {
    setActiveChatId(conversationId);
    setShowSearchPanel(false);
    // TODO: Scroll to specific message if messageIndex is provided
  }, []);

  // Keyboard shortcuts setup
  useEffect(() => {
    // Register keyboard shortcut handlers
    keyboardShortcutService.registerShortcutListener('newChat', () => handleNewChat());
    keyboardShortcutService.registerShortcutListener('togglePanel', () => setIsPanelVisible(prev => !prev));
    keyboardShortcutService.registerShortcutListener('searchConversations', () => setShowSearchPanel(true));
    keyboardShortcutService.registerShortcutListener('commandPalette', () => setShowCommandPalette(true));
    keyboardShortcutService.registerShortcutListener('showTemplates', () => setShowTemplatePanel(true));
    keyboardShortcutService.registerShortcutListener('showPersonalities', () => setShowPersonalityManager(true));
    keyboardShortcutService.registerShortcutListener('toggleTheme', () => handleToggleTheme());
    keyboardShortcutService.registerShortcutListener('showAnalytics', () => setShowAnalytics(true));
    keyboardShortcutService.registerShortcutListener('exportConversation', () => setShowExportImport(true));
    keyboardShortcutService.registerShortcutListener('showShortcuts', () => setShowKeyboardHelp(true));
    keyboardShortcutService.registerShortcutListener('toggleVoice', () => {
      // This will be handled by ChatPanel
    });
    keyboardShortcutService.registerShortcutListener('readLastMessage', () => {
      const currentMessages = conversations.find(c => c.id === activeChatId)?.messages || [];
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage && lastMessage.role === 'model') {
        voiceService.speak(lastMessage.content);
      }
    });

    return () => {
      // Cleanup listeners
      keyboardShortcutService.unregisterShortcutListener('newChat');
      keyboardShortcutService.unregisterShortcutListener('togglePanel');
      keyboardShortcutService.unregisterShortcutListener('searchConversations');
      keyboardShortcutService.unregisterShortcutListener('commandPalette');
      keyboardShortcutService.unregisterShortcutListener('showTemplates');
      keyboardShortcutService.unregisterShortcutListener('showPersonalities');
      keyboardShortcutService.unregisterShortcutListener('toggleTheme');
      keyboardShortcutService.unregisterShortcutListener('showAnalytics');
      keyboardShortcutService.unregisterShortcutListener('exportConversation');
      keyboardShortcutService.unregisterShortcutListener('showShortcuts');
      keyboardShortcutService.unregisterShortcutListener('toggleVoice');
      keyboardShortcutService.unregisterShortcutListener('readLastMessage');
    };
  }, [handleNewChat, handleToggleTheme, conversations, activeChatId]);

  // Command palette handler
  const handleExecuteCommand = useCallback((action: string) => {
    // Track command palette usage
    trackFeatureUsage('command_palette', action);
    
    switch (action) {
      case 'newChat':
        handleNewChat();
        break;
      case 'togglePanel':
        setIsPanelVisible(prev => !prev);
        break;
      case 'searchConversations':
        setShowSearchPanel(true);
        break;
      case 'showTemplates':
        setShowTemplatePanel(true);
        break;
      case 'showPersonalities':
        setShowPersonalityManager(true);
        break;
      case 'toggleTheme':
        handleToggleTheme();
        break;
      case 'showAnalytics':
        setShowAnalytics(true);
        break;
      case 'exportConversation':
        setShowExportImport(true);
        break;
      case 'showShortcuts':
        setShowKeyboardHelp(true);
        break;
      case 'toggleVoice':
        // This will be handled by ChatPanel
        break;
      case 'readLastMessage':
        const currentMessages = conversations.find(c => c.id === activeChatId)?.messages || [];
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          voiceService.speak(lastMessage.content);
        }
        break;
      default:
        console.log('Unknown command:', action);
    }
  }, [handleNewChat, handleToggleTheme, conversations, activeChatId]);

  // Import completion handler
  const handleImportComplete = useCallback((result: any) => {
    if (result.success) {
      // Refresh conversations from localStorage
      try {
        const userPrefix = `earth-${user?.uid}-`;
        const savedConversations = localStorage.getItem(`${userPrefix}conversations`);
        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);
          searchService.buildSearchIndex(parsedConversations);
        }
      } catch (error) {
        console.error('Error refreshing conversations after import:', error);
      }
    }
  }, [user]);



  // Helper functions
  const updateConversationState = (updater: (prevConvs: Conversation[]) => Conversation[]) => {
    setConversations(updater);
  };

  const handleSendMessage = async (message: string, files?: FileMessage[]) => {
    if (!chat || isLoading || !activeChatId) return;
  
    const userMessage: Message = { 
      role: 'user', 
      content: message,
      files: files || []
    };
    
    if (files && files.length > 0) {
      try {
        await Promise.all(
          files.map(file => fileStorage.saveFile({ ...file, conversationId: activeChatId }))
        );
        setAttachedFiles(prev => [...prev, ...files]);
      } catch (error) {
        console.error('Error saving files:', error);
      }
    }
    
    const activeConv = conversations.find(c => c.id === activeChatId);
    const isNewChat = activeConv?.messages.length === 0;

    updateConversationState(prev => 
      prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage] } : c)
    );
    setIsLoading(true);

    if (isNewChat) {
      generateTitle(message, files).then(title => {
        updateConversationState(prev =>
          prev.map(c => c.id === activeChatId ? { ...c, title } : c)
        );
      });
    }

    try {
      let fullMessage = message;
      
      if (files && files.length > 0) {
        files.forEach(file => {
          if (file.type.startsWith('image/')) {
            fullMessage += `\n[Image: ${file.name}]`;
          } else {
            fullMessage += `\n[File: ${file.name}]\n${file.content}\n`;
          }
        });
      }

      const stream = await chat.sendMessageStream({ message: fullMessage });

      let modelResponse = '';
      let fullResponse = '';
      updateConversationState(prev => 
        prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, { role: 'model', content: '' }] } : c)
      );

      for await (const chunk of stream) {
        modelResponse = chunk.text ?? '';
        fullResponse += modelResponse;

        updateConversationState(prev =>
          prev.map(c => {
            if (c.id === activeChatId) {
              const newMessages = [...c.messages];
              newMessages[newMessages.length - 1].content = fullResponse;
              return { ...c, messages: newMessages };
            }
            return c;
          })
        );
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage: Message = { role: 'model', content: 'An error occurred. The AI brain might be overloaded. Please try again.' };
      updateConversationState(prev =>
        prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, errorMessage] } : c)
      );
    } finally {
      setIsLoading(false);
      setResetFilesTrigger(t => t + 1);
    }
  };

  const handlePanelMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setIsPanelVisible(true);
  };

  const handlePanelMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => setIsPanelVisible(false), 300);
  };

  const handleDeleteMessage = (index: number) => {
    if (!activeChatId) return;
    
    updateConversationState(prev =>
      prev.map(c => {
        if (c.id === activeChatId) {
          const newMessages = [...c.messages];
          newMessages.splice(index, 1);
          return { ...c, messages: newMessages };
        }
        return c;
      })
    );
  };

  const handleEditMessage = (index: number, newContent: string) => {
    if (!activeChatId) return;
    
    updateConversationState(prev =>
      prev.map(c => {
        if (c.id === activeChatId) {
          const newMessages = [...c.messages];
          newMessages[index] = { ...newMessages[index], content: newContent };
          return { ...c, messages: newMessages };
        }
        return c;
      })
    );
  };

  const handleRegenerateResponse = async (index: number) => {
    if (!chat || !activeChatId || isLoading) return;
    
    const activeConversation = conversations.find(c => c.id === activeChatId);
    if (!activeConversation) return;
    
    let userMessageIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (activeConversation.messages[i].role === 'user') {
        userMessageIndex = i;
        break;
      }
    }
    
    if (userMessageIndex === -1) return;
    
    const userMessage = activeConversation.messages[userMessageIndex];
    
    updateConversationState(prev =>
      prev.map(c => {
        if (c.id === activeChatId) {
          const newMessages = [...c.messages];
          newMessages[index] = { ...newMessages[index], content: 'Regenerating response...' };
          return { ...c, messages: newMessages };
        }
        return c;
      })
    );
    
    setIsLoading(true);
    
    try {
      let fullMessage = userMessage.content;
      
      if (userMessage.files && userMessage.files.length > 0) {
        userMessage.files.forEach(file => {
          if (file.type.startsWith('image/')) {
            fullMessage += `\n[Image: ${file.name}]`;
          } else {
            fullMessage += `\n[File: ${file.name}]\n${file.content}\n`;
          }
        });
      }

      const stream = await chat.sendMessageStream({ message: fullMessage });

      let modelResponse = '';
      let fullResponse = '';

      for await (const chunk of stream) {
        modelResponse = chunk.text ?? '';
        fullResponse += modelResponse;

        updateConversationState(prev =>
          prev.map(c => {
            if (c.id === activeChatId) {
              const newMessages = [...c.messages];
              newMessages[index].content = fullResponse;
              return { ...c, messages: newMessages };
            }
            return c;
          })
        );
      }
    } catch (error) {
      console.error("Error regenerating response:", error);
      updateConversationState(prev =>
        prev.map(c => {
          if (c.id === activeChatId) {
            const newMessages = [...c.messages];
            newMessages[index].content = 'Failed to regenerate response. Please try again.';
            return { ...c, messages: newMessages };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Computed values
  const activeMessages = conversations.find(c => c.id === activeChatId)?.messages || [];

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center flex flex-col items-center">
          <EarthIcon className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">EARTH</h1>
          <LoadingSpinner size="lg" text="Checking authentication..." />
        </div>
      </div>
    );
  }

  // Auth page
  if (!user) {
    return <AuthPage />;
  }

  // Initializing state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center flex flex-col items-center">
          <EarthIcon className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">EARTH</h1>
          <LoadingSpinner size="lg" text="Initializing AI Brain..." />
        </div>
      </div>
    );
  }

  // Main app
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen font-sans bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <InstallButton />
      <PWAStatusToggle />

      
      {/* Feature Toolbar */}
      <FeatureToolbar
        onShowPersonalities={() => setShowPersonalityManager(true)}
        onShowAnalytics={() => setShowAnalytics(true)}
        onShowExportImport={() => setShowExportImport(true)}
        onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
        onShowCommandPalette={() => setShowCommandPalette(true)}
        onShowSearch={() => setShowSearchPanel(true)}
        onShowTemplates={() => setShowTemplatePanel(true)}
        onShowVoiceSettings={() => setShowVoiceSettings(true)}
      />

      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowFeatureDiscovery(true)}
          className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
          title="Feature Tour"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <UserProfile user={user!} />
      </div>
      
      <ChatPanel
        messages={activeMessages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        attachedFiles={attachedFiles}
        onFileRemove={async (fileId: string) => {
          try {
            await fileStorage.deleteFile(fileId);
            setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
          } catch (error) {
            console.error('Error removing file:', error);
          }
        }}
        resetFilesTrigger={resetFilesTrigger}
        onDeleteMessage={handleDeleteMessage}
        onEditMessage={handleEditMessage}
        onRegenerateResponse={handleRegenerateResponse}
        onVoiceCommand={handleVoiceCommand}
        onShowVoiceSettings={() => setShowVoiceSettings(true)}
        onShowSearch={() => setShowSearchPanel(true)}
        onShowTemplates={() => setShowTemplatePanel(true)}
        onTemplateSelect={handleTemplateSelect}
      />
      
      <div onMouseEnter={handlePanelMouseEnter} onMouseLeave={handlePanelMouseLeave}>
        {!isPanelVisible && <PanelToggleButton />}
        <SidePanel
          isVisible={isPanelVisible}
          initialInstruction={systemInstruction}
          onSave={handleSaveSettings}
          onClear={handleClearSettings}
          saveStatus={saveStatus}
          conversations={conversations}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onShowPersonalities={() => setShowPersonalityManager(true)}
          onShowAnalytics={() => setShowAnalytics(true)}
          onShowExportImport={() => setShowExportImport(true)}
          onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
        />
      </div>
      

      
      {showQuickStart && (
        <QuickStartGuide
          onSelect={(instruction) => {
            setSystemInstruction(instruction);
            handleSaveSettings(instruction);
            setShowQuickStart(false);
            localStorage.setItem(`earth-${user!.uid}-seen-quick-start`, 'true');
          }}
          onClose={() => {
            setShowQuickStart(false);
            localStorage.setItem(`earth-${user!.uid}-seen-quick-start`, 'true');
          }}
        />
      )}

      {showVoiceSettings && (
        <VoiceSettings onClose={() => setShowVoiceSettings(false)} />
      )}

      {showSearchPanel && (
        <SearchPanel
          conversations={conversations}
          onSelectConversation={handleSearchConversationSelect}
          onClose={() => setShowSearchPanel(false)}
        />
      )}

      {showTemplatePanel && (
        <TemplatePanel
          onSelectTemplate={(template, variables) => {
            const content = handleTemplateSelect(template, variables);
            // We'll need to pass this to ChatPanel somehow
            setShowTemplatePanel(false);
          }}
          onClose={() => setShowTemplatePanel(false)}
        />
      )}

      {showPersonalityManager && (
        <PersonalityManager
          currentInstruction={systemInstruction}
          onPersonalityChange={(instruction, name) => {
            handleSaveSettings(instruction);
            setShowPersonalityManager(false);
          }}
          onClose={() => setShowPersonalityManager(false)}
        />
      )}

      {showAnalytics && (
        <ConversationAnalytics
          conversations={conversations}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showExportImport && (
        <ExportImportPanel
          conversations={conversations}
          onImportComplete={handleImportComplete}
          onClose={() => setShowExportImport(false)}
        />
      )}

      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onExecuteCommand={handleExecuteCommand}
        />
      )}

      {showKeyboardHelp && (
        <KeyboardShortcutsHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      )}

      {/* Feature Discovery */}
      {showFeatureDiscovery && (
        <FeatureDiscovery
          onClose={() => {
            setShowFeatureDiscovery(false);
            localStorage.setItem(`earth-${user!.uid}-seen-feature-discovery`, 'true');
          }}
          onShowPersonalities={() => {
            setShowFeatureDiscovery(false);
            localStorage.setItem(`earth-${user!.uid}-seen-feature-discovery`, 'true');
            setShowPersonalityManager(true);
          }}
          onShowCommandPalette={() => {
            setShowFeatureDiscovery(false);
            localStorage.setItem(`earth-${user!.uid}-seen-feature-discovery`, 'true');
            setShowCommandPalette(true);
          }}
        />
      )}

      {/* Feature Notification */}
      {showFeatureNotification && (
        <FeatureNotification
          title="🎉 New Features Available!"
          message="Discover AI personalities, voice controls, search, templates, and more!"
          action={{
            label: "Explore Features",
            onClick: () => setShowFeatureDiscovery(true)
          }}
          onClose={() => {
            setShowFeatureNotification(false);
            localStorage.setItem(`earth-${user!.uid}-seen-feature-notification`, 'true');
          }}
        />
      )}

      {/* Quick Access Button */}
      <QuickAccessButton
        onShowCommandPalette={() => setShowCommandPalette(true)}
        onShowPersonalities={() => setShowPersonalityManager(true)}
        onShowSearch={() => setShowSearchPanel(true)}
        onShowTemplates={() => setShowTemplatePanel(true)}
      />
      </div>
    </ErrorBoundary>
  );
};

export default App;