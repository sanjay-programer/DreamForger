import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Starscape } from '@/components/Starscape';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isSignUp ? 'register' : 'signin';
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.user_id);
        
        // For returning users, check if they have completed onboarding
        if (!isSignUp) {
          const userDetailsResponse = await fetch('http://127.0.0.1:8000/user/details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: data.user_id }),
          });

          const userDetails = await userDetailsResponse.json();
          if (userDetails.success && userDetails.data.name) {
            // User has completed onboarding, go to dashboard
            navigate('/dashboard');
            return;
          }
        }
        
        // New user or incomplete onboarding
        navigate('/onboarding');
      } else {
        toast({
          title: "Error",
          description: data.detail || data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Starscape />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl glassmorphism-dark border-neon-cyan">
          <CardHeader className="space-y-6">
            <CardTitle className="text-5xl font-bold text-center neon-text-cyan">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-xl text-center text-gray-400">
              {isSignUp ? 'Start your journey to success' : 'Continue your journey to success'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" onValueChange={(value) => setIsSignUp(value === 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="signin" className="text-xl data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xl data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-16 bg-background/50 border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-16 bg-background/50 border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 text-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-16 bg-background/50 border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-16 bg-background/50 border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 text-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold">
                    Sign Up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth; 