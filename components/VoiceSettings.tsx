import React, { useState, useEffect } from 'react';
import { voiceService } from '../services/voiceService';

interface VoiceSettingsProps {
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState(voiceService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [testText, setTestText] = useState('Hello! This is a test of the text-to-speech feature.');

  useEffect(() => {
    setVoices(voiceService.getAvailableVoices());
    setLanguages(voiceService.getSupportedLanguages());
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    voiceService.updateSettings({ [key]: value });
  };

  const testVoice = async () => {
    try {
      await voiceService.speak(testText);
    } catch (error) {
      console.error('Voice test failed:', error);
    }
  };

  const stopVoice = () => {
    voiceService.stopSpeaking();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Voice Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Speech Recognition Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Speech Recognition
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Speech Input
                </label>
                <button
                  onClick={() => handleSettingChange('speechEnabled', !settings.speechEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.speechEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.speechEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  disabled={!settings.speechEnabled}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {new Intl.DisplayNames([lang], { type: 'language' }).of(lang) || lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Text-to-Speech Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Text-to-Speech
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Voice Output
                </label>
                <button
                  onClick={() => handleSettingChange('voiceEnabled', !settings.voiceEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.voiceEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-speak AI responses
                </label>
                <button
                  onClick={() => handleSettingChange('autoSpeak', !settings.autoSpeak)}
                  disabled={!settings.voiceEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoSpeak && settings.voiceEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  } ${!settings.voiceEnabled ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSpeak && settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice
                </label>
                <select
                  value={settings.selectedVoice}
                  onChange={(e) => handleSettingChange('selectedVoice', e.target.value)}
                  disabled={!settings.voiceEnabled}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                >
                  {voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speech Rate: {settings.speechRate.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speechRate}
                  onChange={(e) => handleSettingChange('speechRate', parseFloat(e.target.value))}
                  disabled={!settings.voiceEnabled}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pitch: {settings.speechPitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speechPitch}
                  onChange={(e) => handleSettingChange('speechPitch', parseFloat(e.target.value))}
                  disabled={!settings.voiceEnabled}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume: {Math.round(settings.speechVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.speechVolume}
                  onChange={(e) => handleSettingChange('speechVolume', parseFloat(e.target.value))}
                  disabled={!settings.voiceEnabled}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Voice Test */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Voice
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    disabled={!settings.voiceEnabled}
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50"
                    placeholder="Enter text to test..."
                  />
                  <button
                    onClick={testVoice}
                    disabled={!settings.voiceEnabled || !testText.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Test
                  </button>
                  <button
                    onClick={stopVoice}
                    disabled={!settings.voiceEnabled}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Commands Help */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Voice Commands
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Try these voice commands:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• "New chat" - Start a new conversation</li>
                <li>• "Send message" - Send the current message</li>
                <li>• "Dark mode" / "Light mode" - Change theme</li>
                <li>• "Stop listening" - Stop voice input</li>
                <li>• "Read last message" - Read the last AI response</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;