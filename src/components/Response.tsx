
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ActionResponse } from '@/types';
import { Globe, CheckCircle, Clock, Sparkles } from 'lucide-react';
import TypewriterText from './TypewriterText';

interface ResponseProps {
  response: ActionResponse;
  isLatest: boolean;
}

const Response: React.FC<ResponseProps> = ({ response, isLatest }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && isLatest) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [response, isLatest]);

  const renderIcon = () => {
    switch (response.type) {
      case 'result':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-start gap-4 rounded-xl p-4 transition-all",
        "animate-in fade-in slide-up",
        isLatest ? "bg-accent/30" : "bg-transparent"
      )}
    >
      <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
        {renderIcon()}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-muted-foreground">
            AI Assistant
          </span>
          <span className="text-xs text-muted-foreground/50">
            {new Date(response.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          {isLatest ? (
            <TypewriterText 
              text={response.text} 
              speed={20} 
              className="text-foreground"
            />
          ) : (
            <p className="text-foreground">{response.text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Response;
