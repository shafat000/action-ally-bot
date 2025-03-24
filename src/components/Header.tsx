
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BrainCircuit, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 10) {
          headerRef.current.classList.add('glass-effect', 'shadow-soft');
        } else {
          headerRef.current.classList.remove('glass-effect', 'shadow-soft');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300",
        "flex items-center justify-between"
      )}
    >
      <div 
        ref={logoRef}
        className="flex items-center space-x-3"
      >
        <div className="relative">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse" />
        </div>
        <span className="font-semibold text-xl tracking-tight">
          {isMobile ? "ActionAlly" : "ActionAlly"}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={cn(
            "p-2 rounded-full transition-colors duration-200",
            "hover:bg-secondary flex items-center justify-center",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          )}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
