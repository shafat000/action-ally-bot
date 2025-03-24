
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Key, LogIn, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fadeIn, popIn } from '@/utils/animations';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const cardRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  
  React.useEffect(() => {
    fadeIn(cardRef.current);
    popIn(titleRef.current, 0.3);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "You're now logged in",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1770&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed">
      {/* Animated stars */}
      <div className="stars-container absolute inset-0 overflow-hidden opacity-70">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      
      <div className="w-full max-w-md z-10">
        <Card ref={cardRef} className="border-zinc-800 shadow-xl neo-blur text-white">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <Star className="h-10 w-10 text-blue-500 animate-pulse" />
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 rounded-full"></div>
              </div>
            </div>
            <CardTitle ref={titleRef} className="text-2xl font-bold text-center text-gradient">
              Mission Control
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Enter your credentials to access the command center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Comms ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="astronaut@space.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300">Security Code</Label>
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot code?
                  </Link>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-700 text-zinc-300"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initiating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Launch Mission
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-zinc-500">Or</span>
              </div>
            </div>
            <p className="text-center text-sm text-zinc-400">
              New astronaut?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300">
                Register for mission
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
