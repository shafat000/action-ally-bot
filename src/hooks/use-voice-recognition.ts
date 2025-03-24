
import { useState, useEffect, useCallback } from 'react';

interface UseVoiceRecognitionProps {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
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
}: UseVoiceRecognitionProps = {}): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Reference to the SpeechRecognition instance
  const recognitionRef = useCallback(() => {
    // Browser compatibility check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      if (onError) onError('Speech recognition is not supported in this browser');
      return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    return recognition;
  }, [language, onError]);
  
  const startListening = useCallback(() => {
    const recognition = recognitionRef();
    if (!recognition) return;
    
    setError(null);
    setTranscript('');
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      setTranscript(transcriptResult);
      
      // If we have a final result, call the onResult callback
      if (event.results[current].isFinal && onResult) {
        onResult(transcriptResult);
      }
    };
    
    try {
      recognition.start();
    } catch (err) {
      const errorMessage = `Could not start speech recognition: ${err}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    }
  }, [recognitionRef, onResult, onError]);
  
  const stopListening = useCallback(() => {
    const recognition = recognitionRef();
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
  }, [recognitionRef]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        const recognition = recognitionRef();
        if (recognition) {
          recognition.stop();
        }
      }
    };
  }, [isListening, recognitionRef]);
  
  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
  };
};

export default useVoiceRecognition;
