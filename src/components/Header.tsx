
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
  const { user, logout } = useAuth();
  
  // Create a safe navigation function that checks if we're in a Router context
  const safeNavigate = () => {
    try {
      const navigate = useNavigate();
      return navigate;
    } catch (error) {
      // If useNavigate throws an error, return a dummy function
      console.warn("Navigation not available, likely outside Router context");
      return () => {};
    }
  };
  
  // Get the navigation function safely
  const navigate = safeNavigate();

  const handleLogout = async () => {
    await logout();
    // Only try to navigate if we're in a Router context
    try {
      navigate('/login');
    } catch (error) {
      console.warn("Navigation failed, likely outside Router context");
      // Fallback: use window.location as a last resort
      window.location.href = '/login';
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 p-4",
      "bg-background/80 backdrop-blur-md border-b border-border"
    )}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">ActionAlly</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.name || user.email}</span>
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          {user && (
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
