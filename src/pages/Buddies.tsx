import { useState, useEffect } from 'react';
import { Starscape } from "@/components/Starscape";
import { Sidebar } from "@/components/Sidebar";
import { Search, Filter, UserPlus, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { Loading } from '@/components/ui/loading';

interface Buddy {
  user_id: number;
  name: string;
  age: number;
  dream: string;
  location: string;
  activated_skills: { [key: string]: string } | null;
}

interface BuddyCardProps {
  buddy: Buddy;
  onConnect: (userId: number) => void;
}

const BuddyCard = ({ buddy, onConnect }: BuddyCardProps) => {
  const skills = buddy.activated_skills ? Object.keys(buddy.activated_skills).slice(0, 3) : [];

  return (
    <div className="glassmorphism rounded-lg p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
      <div className="flex justify-between">
        <div className="flex space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl font-bold">
              {buddy.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cosmic-black bg-neon-green" />
          </div>
          
          {/* Info */}
          <div>
            <h3 className="font-bold">{buddy.name}</h3>
            <p className="text-sm text-gray-300">{buddy.dream}</p>
            <p className="text-xs text-gray-400">{buddy.location}</p>
          </div>
        </div>
      </div>
      
      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={index} 
                className="text-xs py-1 px-2 rounded-full bg-white/10"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Connect button - visible on hover */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => onConnect(buddy.user_id)}
          className="flex items-center justify-center space-x-2 w-full py-2 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 transition-all duration-200 border border-neon-cyan"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Connect</span>
        </button>
      </div>
    </div>
  );
};

const Buddies = () => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [recommendedBuddies, setRecommendedBuddies] = useState<Buddy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDream, setSelectedDream] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const { toast } = useToast();

  // Fetch all buddies
  const fetchBuddies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/buddies');
      const data = await response.json();
      if (data.buddies) {
        setBuddies(data.buddies);
      }
    } catch (error) {
      console.error('Error fetching buddies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch buddies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch buddies by name
  const searchBuddies = async (name: string) => {
    if (!name.trim()) {
      fetchBuddies();
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/buddies/by-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (data.buddies) {
        setBuddies(data.buddies);
      } else {
        setBuddies([]);
      }
    } catch (error) {
      console.error('Error searching buddies:', error);
      toast({
        title: "Error",
        description: "Failed to search buddies",
        variant: "destructive",
      });
    }
  };

  // Fetch buddies by dream
  const filterByDream = async (dream: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/buddies/by-dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream }),
      });
      const data = await response.json();
      if (data.buddies) {
        setBuddies(data.buddies);
      } else {
        setBuddies([]);
      }
    } catch (error) {
      console.error('Error filtering buddies:', error);
      toast({
        title: "Error",
        description: "Failed to filter buddies",
        variant: "destructive",
      });
    }
  };

  // Fetch recommended buddies
  const fetchRecommendedBuddies = async () => {
    try {
      // Get current user's dream and location
      const userResponse = await fetch('http://127.0.0.1:8000/user/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      const userData = await userResponse.json();
      
      if (userData.success) {
        const response = await fetch('http://127.0.0.1:8000/buddies/by-dream-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dream: userData.data.dream,
            location: userData.data.location,
          }),
        });
        const data = await response.json();
        if (data.buddies) {
          setRecommendedBuddies(data.buddies);
        }
      }
    } catch (error) {
      console.error('Error fetching recommended buddies:', error);
    }
  };

  useEffect(() => {
    fetchBuddies();
    fetchRecommendedBuddies();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchBuddies(value);
  };

  const handleConnect = (userId: number) => {
    // Implement connection logic here
    toast({
      title: "Connection Request",
      description: "Connection request sent successfully!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 pl-[240px] p-8">
          <Loading variant="default" message="Finding your dream buddies..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 pl-[240px] p-8">
        <header className="mb-8">
          <h1 className="text-5xl font-bold neon-text-cyan mb-4">Find Dream Buddies</h1>
          <p className="text-2xl text-gray-400">Connect with others on similar learning journeys</p>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name..."
              className="w-full pl-12 pr-4 py-3 text-xl rounded-lg glassmorphism bg-white/5 border border-white/20 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
            />
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={() => {
                setSelectedDream(null);
                fetchBuddies();
              }}
              className={cn(
                "py-3 px-6 text-xl rounded-lg border",
                !selectedDream 
                  ? "bg-neon-cyan/20 border-neon-cyan hover:neon-glow-cyan"
                  : "bg-white/5 border-white/20 hover:border-white/40"
              )}
            >
              All
            </button>
            <button 
              onClick={() => {
                setSelectedDream('chef');
                filterByDream('chef');
              }}
              className={cn(
                "py-3 px-6 text-xl rounded-lg border",
                selectedDream === 'chef'
                  ? "bg-neon-cyan/20 border-neon-cyan hover:neon-glow-cyan"
                  : "bg-white/5 border-white/20 hover:border-white/40"
              )}
            >
              Chef
            </button>
            <button 
              onClick={() => {
                setSelectedDream('enterprenuer');
                filterByDream('enterprenuer');
              }}
              className={cn(
                "py-3 px-6 text-xl rounded-lg border",
                selectedDream === 'enterprenuer'
                  ? "bg-neon-cyan/20 border-neon-cyan hover:neon-glow-cyan"
                  : "bg-white/5 border-white/20 hover:border-white/40"
              )}
            >
              Entrepreneur
            </button>
          </div>
        </div>

        {/* Buddy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {buddies.map(buddy => (
            <BuddyCard
              key={buddy.user_id}
              buddy={buddy}
              onConnect={handleConnect}
            />
          ))}
        </div>

        {/* Recommended Connections */}
        {recommendedBuddies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 neon-text-magenta">Recommended Connections</h2>
            <div className="glassmorphism-dark rounded-lg p-8">
              {recommendedBuddies.map(buddy => (
                <div key={buddy.user_id} className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-magenta to-neon-cyan flex items-center justify-center text-2xl font-bold">
                      {buddy.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{buddy.name}</h3>
                      <p className="text-xl text-gray-300">{buddy.dream} • {buddy.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleConnect(buddy.user_id)}
                      className="py-2 px-6 text-xl rounded-lg bg-neon-cyan/20 border border-neon-cyan hover:neon-glow-cyan"
                    >
                      <span className="font-medium">Connect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buddies;
