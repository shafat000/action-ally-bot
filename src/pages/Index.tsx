import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import ActionPanel from '@/components/ActionPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { popIn, fadeIn } from '@/utils/animations';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    // Check for user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Apply animations safely
    fadeIn(mainRef.current);
    popIn(titleRef.current, 0.3);
    popIn(subtitleRef.current, 0.4);
  }, []);
  
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };
  
  return (
    <div 
      ref={mainRef}
      className={cn(
        "min-h-screen flex flex-col bg-background transition-colors duration-300",
        "bg-grid relative"
      )}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />
      
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="flex-1 flex flex-col items-center pt-24 px-4">
        <div className="w-full max-w-3xl mx-auto mb-8 text-center">
          <h1 
            ref={titleRef}
            className={cn(
              "text-4xl font-bold tracking-tight mb-3",
              "bg-clip-text text-transparent",
              "bg-gradient-to-r from-foreground to-foreground/70"
            )}
          >
            Your AI-Powered Personal Assistant
          </h1>
          <p 
            ref={subtitleRef}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Let ActionAlly help you browse the web, shop online, book travel, schedule meetings, and complete tasks – all through natural conversation.
          </p>
        </div>
        
        <div 
          className={cn(
            "w-full flex-1 flex flex-col bg-card rounded-t-2xl",
            "shadow-soft border border-border overflow-hidden",
            "max-w-3xl mx-auto mb-0 transition-all duration-300"
          )}
        >
          <ActionPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
