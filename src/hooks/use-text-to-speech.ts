
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTextToSpeechProps {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: number; // Index of the voice to use
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
}

const useTextToSpeech = ({
  rate = 1,
  pitch = 1,
  volume = 1,
  voice = 0,
  onStart,
  onEnd,
  onError,
}: UseTextToSpeechProps = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth.current = window.speechSynthesis;
      
      // Get available voices
      const loadVoices = () => {
        // Only update voices if they actually changed to prevent infinite loops
        const availableVoices = synth.current?.getVoices() || [];
        if (availableVoices.length > 0 && !voicesLoadedRef.current) {
          setVoices(availableVoices);
          voicesLoadedRef.current = true;
        }
      };

      // Chrome loads voices asynchronously
      if (synth.current.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices;
      }
      
      // Initial load of voices
      loadVoices();

      // Clean up on unmount
      return () => {
        if (synth.current) {
          try {
            if (synth.current.speaking) {
              // Make sure to cancel any speech when component unmounts
              synth.current.cancel();
            }
          } catch (error) {
            console.error('Error canceling speech on unmount:', error);
          }
        }
      };
    } else {
      if (onError) onError('Speech synthesis is not supported in this browser');
      console.error('Speech synthesis is not supported in this browser');
    }
  }, [onError]);

  // Helper function to create and configure a new utterance
  const createUtterance = useCallback((text: string) => {
    if (!synth.current) return null;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Set voice if available
      if (voices.length > 0) {
        const voiceIndex = Math.min(voice, voices.length - 1);
        utterance.voice = voices[voiceIndex];
      }
      
      return utterance;
    } catch (error) {
      console.error('Error creating utterance:', error);
      return null;
    }
  }, [rate, pitch, volume, voice, voices]);

  // Start speaking with proper error handling
  const startSpeaking = useCallback((text: string) => {
    if (!synth.current) return;
    
    try {
      // Create a new utterance
      const utterance = createUtterance(text);
      if (!utterance) return;
      
      utteranceRef.current = utterance;

      // Set event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        
        // Special handling for "interrupted" error which is common and often not a real error
        if (event.error === 'interrupted') {
          console.log('Speech was interrupted, likely due to new speech request');
        } else {
          setIsSpeaking(false);
          setIsPaused(false);
          if (onError) onError(`Speech synthesis error: ${event.error}`);
        }
      };

      // Start speaking
      synth.current.speak(utterance);
    } catch (error) {
      console.error('Error starting speech:', error);
      setIsSpeaking(false);
      if (onError) onError(`Error starting speech: ${error}`);
    }
  }, [createUtterance, onStart, onEnd, onError]);

  // Speak the provided text
  const speak = useCallback((text: string) => {
    if (!synth.current) {
      if (onError) onError('Speech synthesis is not available');
      return;
    }

    try {
      // Cancel any ongoing speech
      if (synth.current.speaking) {
        try {
          // First cancel current speech
          synth.current.cancel();
          
          // Wait a bit before starting new speech to avoid interrupted errors
          setTimeout(() => {
            startSpeaking(text);
          }, 100);
        } catch (error) {
          console.error('Error canceling previous speech:', error);
          if (onError) onError(`Error canceling previous speech: ${error}`);
        }
      } else {
        // No ongoing speech, start immediately
        startSpeaking(text);
      }
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      setIsSpeaking(false);
      setIsPaused(false);
      if (onError) onError(`Error in speech synthesis: ${error}`);
    }
  }, [startSpeaking, onError]);

  // Stop speaking
  const stop = useCallback(() => {
    if (!synth.current) return;
    
    try {
      synth.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (!synth.current || !isSpeaking || isPaused) return;
    
    try {
      synth.current.pause();
      setIsPaused(true);
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }, [isSpeaking, isPaused]);

  // Resume speaking
  const resume = useCallback(() => {
    if (!synth.current || !isPaused) return;
    
    try {
      synth.current.resume();
      setIsPaused(false);
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }, [isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
  };
};

export default useTextToSpeech;
