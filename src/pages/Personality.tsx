import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from "@/components/ui/slider";

const Personality = () => {
  const [socialEnergy, setSocialEnergy] = useState(50);
  const [approach, setApproach] = useState(50);
  const [decisionMaking, setDecisionMaking] = useState(50);
  const [workStyle, setWorkStyle] = useState(50);
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/user/personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          social_energy: socialEnergy,
          approach: approach,
          decission_making: decisionMaking,
          work_style: workStyle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred",
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
          <CardTitle className="text-4xl text-white">Personality Assessment</CardTitle>
          <CardDescription className="text-xl text-gray-300">
            Let us know your preferences to customize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl text-white mb-4">Social Energy</h3>
                <Slider
                  value={[socialEnergy]}
                  onValueChange={(value) => setSocialEnergy(value[0])}
                  max={100}
                  step={1}
                  className="h-8"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xl text-gray-300">Introvert</span>
                  <span className="text-xl text-gray-300">Extrovert</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">Approach</h3>
                <Slider
                  value={[approach]}
                  onValueChange={(value) => setApproach(value[0])}
                  max={100}
                  step={1}
                  className="h-8"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xl text-gray-300">Practical</span>
                  <span className="text-xl text-gray-300">Creative</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">Decision Making</h3>
                <Slider
                  value={[decisionMaking]}
                  onValueChange={(value) => setDecisionMaking(value[0])}
                  max={100}
                  step={1}
                  className="h-8"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xl text-gray-300">Analytical</span>
                  <span className="text-xl text-gray-300">Intuitive</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">Work Style</h3>
                <Slider
                  value={[workStyle]}
                  onValueChange={(value) => setWorkStyle(value[0])}
                  max={100}
                  step={1}
                  className="h-8"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xl text-gray-300">Structured</span>
                  <span className="text-xl text-gray-300">Flexible</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Personality; 