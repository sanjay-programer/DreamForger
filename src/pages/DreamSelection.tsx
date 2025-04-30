import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Starscape } from '@/components/Starscape';

const predefinedCareers = [
  { name: 'Doctor', icon: '🏥' },
  { name: 'Software Developer', icon: '💻' },
  { name: 'YouTuber', icon: '🎥' },
  { name: 'Chef', icon: '👨‍🍳' },
  { name: 'Designer', icon: '🎨' },
  { name: 'Engineer', icon: '⚙️' }
];

const DreamSelection = () => {
  const [dream, setDream] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/user/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();
        if (data.success) {
          setUserLocation(data.data.location);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, save the dream
      const saveResponse = await fetch('http://127.0.0.1:8000/user/dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          dream: dream.toLowerCase(),
        }),
      });

      const saveData = await saveResponse.json();

      if (saveData.success) {
        // Then generate the roadmap
        const roadmapResponse = await fetch('http://127.0.0.1:8000/generate_roadmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dream: dream.toLowerCase(),
            location: userLocation,
          }),
        });

        const roadmapData = await roadmapResponse.json();

        if (roadmapData.phases) {
          // Store the roadmap data in localStorage for the roadmap page
          localStorage.setItem('roadmapData', JSON.stringify(roadmapData));
          toast({
            title: "Success",
            description: "Your dream has been set and roadmap generated!",
          });
          navigate('/personality');
        } else {
          throw new Error('Failed to generate roadmap');
        }
      } else {
        toast({
          title: "Error",
          description: saveData.message || "An error occurred",
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-4xl bg-gray-800 border-neon-cyan">
        <CardHeader>
          <CardTitle className="text-4xl text-white">What's Your Dream?</CardTitle>
          <CardDescription className="text-xl text-gray-300">
            Choose your dream career path
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {predefinedCareers.map((career) => (
              <button
                key={career.name}
                onClick={() => {
                  setDream(career.name);
                  setShowCustomInput(false);
                }}
                className={`p-6 rounded-lg text-2xl flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${
                  dream === career.name
                    ? 'bg-neon-cyan text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <span className="text-4xl">{career.icon}</span>
                <span>{career.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className={`p-4 rounded-lg text-xl flex items-center space-x-2 transition-all duration-300 ${
                showCustomInput
                  ? 'bg-neon-cyan text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <span>+</span>
              <span>Custom Dream</span>
            </button>
          </div>
          {showCustomInput && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your dream career"
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                className="h-14 text-xl bg-gray-700 text-white border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!dream}
            className="w-full h-14 text-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold mt-8"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DreamSelection; 