// Voice Service for speech-to-text and text-to-speech functionality
// Uses Web Speech API for free voice integration

interface VoiceSettings {
  speechEnabled: boolean;
  voiceEnabled: boolean;
  selectedVoice: string;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  autoSpeak: boolean;
  language: string;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isListening = false;
  private settings: VoiceSettings;
  private readonly SETTINGS_KEY = 'earth-voice-settings';

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.settings = this.loadSettings();
    this.initializeSpeechRecognition();
    this.loadVoices();
    
    // Load voices when they become available
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadSettings(): VoiceSettings {
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): VoiceSettings {
    return {
      speechEnabled: true,
      voiceEnabled: true,
      selectedVoice: '',
      speechRate: 1.0,
      speechPitch: 1.0,
      speechVolume: 1.0,
      autoSpeak: false,
      language: 'en-US'
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  }

  private initializeSpeechRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.settings.language;
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    
    // Set default voice if none selected
    if (!this.settings.selectedVoice && this.voices.length > 0) {
      const defaultVoice = this.voices.find(voice => voice.default) || this.voices[0];
      this.settings.selectedVoice = defaultVoice.name;
      this.saveSettings();
    }
  }

  // Speech Recognition Methods
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || !this.settings.speechEnabled) {
        reject(new Error('Speech recognition not available or disabled'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        const errorMessage = `Speech recognition error: ${event.error}`;
        console.error(errorMessage);
        if (onError) onError(errorMessage);
        reject(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        resolve();
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  // Text-to-Speech Methods
  public speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.settings.voiceEnabled) {
        resolve();
        return;
      }

      // Stop any current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply settings
      const settings = { ...this.settings, ...options };
      utterance.rate = settings.speechRate;
      utterance.pitch = settings.speechPitch;
      utterance.volume = settings.speechVolume;
      utterance.lang = settings.language;

      // Set voice
      if (settings.selectedVoice) {
        const voice = this.voices.find(v => v.name === settings.selectedVoice);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    this.synthesis.cancel();
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  // Voice Commands
  public processVoiceCommand(command: string): { action: string; params?: any } | null {
    const lowerCommand = command.toLowerCase().trim();
    
    // Navigation commands
    if (lowerCommand.includes('new chat') || lowerCommand.includes('start new')) {
      return { action: 'newChat' };
    }
    
    if (lowerCommand.includes('delete message') || lowerCommand.includes('remove message')) {
      return { action: 'deleteMessage' };
    }
    
    if (lowerCommand.includes('clear chat') || lowerCommand.includes('clear conversation')) {
      return { action: 'clearChat' };
    }
    
    if (lowerCommand.includes('send message') || lowerCommand.includes('send')) {
      return { action: 'sendMessage' };
    }
    
    if (lowerCommand.includes('stop listening') || lowerCommand.includes('stop recording')) {
      return { action: 'stopListening' };
    }
    
    if (lowerCommand.includes('read last message') || lowerCommand.includes('repeat')) {
      return { action: 'readLastMessage' };
    }

    // Theme commands
    if (lowerCommand.includes('dark mode') || lowerCommand.includes('dark theme')) {
      return { action: 'setTheme', params: 'dark' };
    }
    
    if (lowerCommand.includes('light mode') || lowerCommand.includes('light theme')) {
      return { action: 'setTheme', params: 'light' };
    }

    return null;
  }

  // Settings Management
  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Update recognition language if changed
    if (this.recognition && newSettings.language) {
      this.recognition.lang = newSettings.language;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  public getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.voices.forEach(voice => {
      languages.add(voice.lang);
    });
    return Array.from(languages).sort();
  }

  // Capability checks
  public isSpeechRecognitionSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSpeechSynthesisSupported(): boolean {
    return !!window.speechSynthesis;
  }

  public isVoiceSupported(): boolean {
    return this.isSpeechRecognitionSupported() && this.isSpeechSynthesisSupported();
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Create singleton instance
export const voiceService = new VoiceService();
export default voiceService;