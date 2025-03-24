
import { useState, useEffect, useCallback } from 'react';

interface UseVoiceRecognitionProps {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  maxNetworkRetries?: number;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  error: string | null;
}

// Define proper TypeScript interfaces for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
}

// Define the global SpeechRecognition constructor
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const useVoiceRecognition = ({
  onResult,
  onError,
  language = 'en-US',
  maxNetworkRetries = 3,
}: UseVoiceRecognitionProps = {}): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [networkRetries, setNetworkRetries] = useState(0);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Initialize the SpeechRecognition API
  const initializeRecognition = useCallback(() => {
    // Browser compatibility check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const errorMsg = 'Speech recognition is not supported in this browser';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return null;
    }
    
    const instance = new SpeechRecognition();
    
    // Configure the recognition instance
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = language;
    
    // Set event handlers
    instance.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
      setError(null);
    };
    
    instance.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      
      if (event.error === 'network') {
        const errorMessage = `Speech recognition network error. Please check your internet connection.`;
        console.warn(errorMessage);
        
        if (networkRetries < maxNetworkRetries) {
          setNetworkRetries(prev => prev + 1);
          console.log(`Retrying connection (${networkRetries + 1}/${maxNetworkRetries})`);
          
          // Attempt to restart with a delay
          setTimeout(() => {
            try {
              instance.stop();
              setTimeout(() => instance.start(), 500);
            } catch (e) {
              console.error('Error during retry:', e);
            }
          }, 1000);
          return;
        }
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setIsListening(false);
      } else {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    };
    
    instance.onend = () => {
      console.log('Voice recognition ended');
      
      // Only attempt to restart if we were actively listening
      // and it wasn't manually stopped (isListening will be false if manually stopped)
      if (isListening && networkRetries < maxNetworkRetries) {
        try {
          console.log('Restarting recognition after unexpected end');
          setTimeout(() => instance.start(), 300);
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };
    
    instance.onresult = (event: SpeechRecognitionEvent) => {
      // Reset network retries on successful result
      setNetworkRetries(0);
      
      // Get the current result
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      
      // Update transcript state
      setTranscript(transcriptResult);
      
      // If we have a final result, call the onResult callback
      if (event.results[current].isFinal && onResult) {
        onResult(transcriptResult);
      }
    };
    
    return instance;
  }, [language, onError, onResult, isListening, networkRetries, maxNetworkRetries]);
  
  // Start listening for speech
  const startListening = useCallback(() => {
    // Reset state
    setError(null);
    setTranscript('');
    setNetworkRetries(0);
    
    try {
      // Create a new instance each time to avoid any stale state
      const newRecognition = initializeRecognition();
      if (!newRecognition) return;
      
      setRecognition(newRecognition);
      newRecognition.start();
      console.log('Voice recognition requested to start');
    } catch (err) {
      const errorMessage = `Could not start speech recognition: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    }
  }, [initializeRecognition, onError]);
  
  // Stop listening for speech
  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
        console.log('Voice recognition stopped manually');
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setIsListening(false);
  }, [recognition]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error('Error cleaning up recognition:', e);
        }
      }
    };
  }, [recognition]);
  
  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
  };
};

export default useVoiceRecognition;
