import React, { useState, useEffect } from 'react';
import { voiceService } from '../services/voiceService';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  onVoiceCommand?: (command: string, action: string, params?: any) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  onTranscript,
  onVoiceCommand,
  disabled = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(voiceService.isSpeechRecognitionSupported());
  }, []);

  const startListening = async () => {
    if (disabled || !isSupported) return;

    try {
      setError(null);
      setIsListening(true);
      setTranscript('');

      await voiceService.startListening(
        (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            onTranscript(text);
            
            // Check for voice commands
            if (onVoiceCommand) {
              const command = voiceService.processVoiceCommand(text);
              if (command) {
                onVoiceCommand(text, command.action, command.params);
              }
            }
            
            setTranscript('');
            setIsListening(false);
          }
        },
        (errorMsg) => {
          setError(errorMsg);
          setIsListening(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice recognition failed');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setTranscript('');
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`p-2 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Live transcript display */}
      {transcript && (
        <div className="flex-1 min-w-0">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
            <p className="text-sm text-blue-800 dark:text-blue-200 truncate">
              {transcript}
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex-1 min-w-0">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <p className="text-sm text-red-800 dark:text-red-200 truncate">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;