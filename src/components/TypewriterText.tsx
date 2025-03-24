
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  className = '',
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const index = useRef(0);
  
  useEffect(() => {
    if (!text) {
      setIsTyping(false);
      return;
    }
    
    // Reset when text changes
    setDisplayedText('');
    index.current = 0;
    setIsTyping(true);
    
    const typingInterval = setInterval(() => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current += 1;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
        if (onComplete) onComplete();
      }
    }, speed);
    
    return () => clearInterval(typingInterval);
  }, [text, speed, onComplete]);
  
  return (
    <span className={className}>
      {displayedText}
      {isTyping && <span className="typewriter-cursor" aria-hidden="true" />}
    </span>
  );
};

export default TypewriterText;
