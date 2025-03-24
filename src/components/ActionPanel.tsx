
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SendHorizontal, Mic, Globe, ShoppingCart, CalendarDays, Loader2 } from 'lucide-react';
import { ActionRequest, ActionResponse, SuggestionItem } from '@/types';
import Response from './Response';
import { useToast } from '@/components/ui/use-toast';
import { popIn } from '@/utils/animations';
import { v4 as uuidv4 } from 'uuid';
import useVoiceRecognition from '@/hooks/use-voice-recognition';

// Mock API response delay
const simulateResponse = async (text: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lowercasedText = text.toLowerCase();
  
  if (lowercasedText.includes('weather')) {
    return "Based on your location, it's currently 72°F and sunny with light clouds. The forecast for today shows clear skies with a high of 75°F and a low of 58°F.";
  } else if (lowercasedText.includes('flight') || lowercasedText.includes('book')) {
    return "I found several flight options from New York to London next week. The best deal seems to be with British Airways departing on Tuesday at 7:30 PM for $650 round trip. Would you like me to provide more details or help with the booking?";
  } else if (lowercasedText.includes('shop') || lowercasedText.includes('buy')) {
    return "I can help you shop for that. Based on your preferences and past purchases, here are some options I've found from trusted retailers with good reviews. Would you like me to narrow down the results based on specific features or price range?";
  } else if (lowercasedText.includes('schedule') || lowercasedText.includes('meeting')) {
    return "I've checked your calendar and you appear to be free next Monday afternoon and Wednesday morning. Would you like me to schedule this meeting for one of those times?";
  } else {
    return "I understand you need assistance with this task. Could you provide a bit more detail about what you'd like me to do? I can help with web searches, shopping recommendations, travel bookings, and much more.";
  }
};

// Mock suggestions
const SUGGESTIONS: SuggestionItem[] = [
  { id: '1', text: 'Find flights to London next week', icon: 'Globe' },
  { id: '2', text: 'Check the weather for my location', icon: 'Cloud' },
  { id: '3', text: 'Help me shop for noise-cancelling headphones', icon: 'ShoppingCart' },
  { id: '4', text: 'Schedule a meeting with my team', icon: 'CalendarDays' },
];

const ActionPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [requests, setRequests] = useState<ActionRequest[]>([]);
  const [responses, setResponses] = useState<ActionResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Voice recognition integration
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcript 
  } = useVoiceRecognition({
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setInput(finalTranscript);
        // Auto-submit if we have a final transcript that's not too short
        if (finalTranscript.length > 5) {
          handleSubmit({ preventDefault: () => {} } as React.FormEvent);
        }
      }
    },
    onError: (errorMessage) => {
      toast({
        title: "Voice Recognition Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
  
  // Animation refs
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Apply animations to suggestions safely
    suggestionRefs.current.forEach((ref, index) => {
      if (ref) {
        popIn(ref, 0.1 * index);
      }
    });
    
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update input when transcript changes during listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    setInput(suggestion.text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const requestId = uuidv4();
    const newRequest: ActionRequest = {
      id: requestId,
      text: input.trim(),
      timestamp: new Date(),
      status: 'pending'
    };
    
    setRequests(prev => [...prev, newRequest]);
    setInput('');
    setIsProcessing(true);
    
    // Add initial processing response
    const processingResponse: ActionResponse = {
      id: uuidv4(),
      requestId,
      text: "I'm working on this for you...",
      timestamp: new Date(),
      type: 'text'
    };
    
    setResponses(prev => [...prev, processingResponse]);
    
    try {
      // Simulate API call
      const responseText = await simulateResponse(newRequest.text);
      
      // Remove processing message and add real response
      setResponses(prev => {
        const filtered = prev.filter(r => r.id !== processingResponse.id);
        return [
          ...filtered, 
          {
            id: uuidv4(),
            requestId,
            text: responseText,
            timestamp: new Date(),
            type: 'text'
          }
        ];
      });
      
      // Update request status
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'completed' } : req
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive",
      });
      
      // Update request status to error
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'error' } : req
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      toast({
        title: "Voice Input Stopped",
        description: "I'm no longer listening."
      });
    } else {
      startListening();
      toast({
        title: "Voice Input Active",
        description: "I'm listening. Speak your request."
      });
    }
  };
  
  // Generate welcome message on first load
  useEffect(() => {
    if (responses.length === 0) {
      setResponses([
        {
          id: uuidv4(),
          requestId: 'welcome',
          text: "Hello, I'm your AI assistant. I can help you browse the web, shop online, schedule meetings, and much more. What would you like me to do for you today?",
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }
  }, [responses.length]);

  const renderSuggestionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe':
        return <Globe className="h-4 w-4" />;
      case 'ShoppingCart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'CalendarDays':
        return <CalendarDays className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-3xl mx-auto flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Responses */}
        <div className="space-y-6">
          {responses.map((response, index) => (
            <Response 
              key={response.id} 
              response={response} 
              isLatest={index === responses.length - 1}
            />
          ))}
        </div>
      </div>
      
      {/* Suggestion chips */}
      {responses.length > 0 && requests.length === 0 && (
        <div className="px-4 py-3">
          <p className="text-sm text-muted-foreground mb-3">You could try:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={suggestion.id}
                ref={el => suggestionRefs.current[index] = el}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-sm bg-secondary hover:bg-secondary/80 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                )}
              >
                {renderSuggestionIcon(suggestion.icon)}
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input form */}
      <div className="border-t py-4 px-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "What would you like me to do for you?"}
                className={cn(
                  "w-full py-3 px-4 pr-12 rounded-lg",
                  "border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-40",
                  "placeholder:text-muted-foreground/60 transition-shadow duration-200",
                  isListening && "border-primary border-2 animate-pulse"
                )}
                disabled={isProcessing}
              />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "p-1.5 rounded-full transition-opacity duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                      !input.trim() ? "opacity-50 cursor-not-allowed" : "text-primary hover:bg-primary/10"
                    )}
                    aria-label="Send message"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleVoiceInput}
              className={cn(
                "p-3 rounded-full transition-colors duration-200",
                isListening 
                  ? "bg-primary text-primary-foreground pulse-glow" 
                  : "bg-secondary text-foreground hover:bg-secondary/80",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              )}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
      
      {/* Voice recognition status indicator */}
      {isListening && (
        <div className="text-center py-2 text-sm text-primary animate-pulse">
          Listening... Speak now.
        </div>
      )}
    </div>
  );
};

export default ActionPanel;
