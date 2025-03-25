
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

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth.current = window.speechSynthesis;
      
      // Get available voices
      const loadVoices = () => {
        const availableVoices = synth.current?.getVoices() || [];
        setVoices(availableVoices);
      };

      // Chrome loads voices asynchronously
      if (synth.current.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices;
      }
      
      // Initial load of voices
      loadVoices();

      // Clean up on unmount
      return () => {
        if (synth.current?.speaking) {
          synth.current.cancel();
        }
      };
    } else {
      if (onError) onError('Speech synthesis is not supported in this browser');
      console.error('Speech synthesis is not supported in this browser');
    }
  }, [onError]);

  // Speak the provided text
  const speak = useCallback((text: string) => {
    if (!synth.current) {
      if (onError) onError('Speech synthesis is not available');
      return;
    }

    // Cancel any ongoing speech
    synth.current.cancel();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set properties
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Set voice if available
    if (voices.length > 0) {
      const voiceIndex = Math.min(voice, voices.length - 1);
      utterance.voice = voices[voiceIndex];
    }

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
      if (onError) onError(`Speech synthesis error: ${event.error}`);
    };

    // Start speaking
    synth.current.speak(utterance);
  }, [rate, pitch, volume, voice, voices, onStart, onEnd, onError]);

  // Stop speaking
  const stop = useCallback(() => {
    if (!synth.current) return;
    
    synth.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (!synth.current || !isSpeaking || isPaused) return;
    
    synth.current.pause();
    setIsPaused(true);
  }, [isSpeaking, isPaused]);

  // Resume speaking
  const resume = useCallback(() => {
    if (!synth.current || !isPaused) return;
    
    synth.current.resume();
    setIsPaused(false);
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
