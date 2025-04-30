import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Onboarding = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/user/basic-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name,
          age: parseInt(age),
          education,
          location,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/dream-selection');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-[800px] bg-gray-800 border-neon-cyan">
        <CardHeader>
          <CardTitle className="text-4xl text-white">Complete Your Profile</CardTitle>
          <CardDescription className="text-xl text-gray-300">
            Tell us a bit about yourself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-14 text-xl bg-gray-700 text-white border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
            />
            <Input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="h-14 text-xl bg-gray-700 text-white border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
            />
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger className="h-14 text-xl bg-gray-700 text-white border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan">
                <SelectValue placeholder="Select Education Level" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="high-school" className="text-xl">High School</SelectItem>
                <SelectItem value="bachelors" className="text-xl">Bachelor's Degree</SelectItem>
                <SelectItem value="masters" className="text-xl">Master's Degree</SelectItem>
                <SelectItem value="phd" className="text-xl">PhD</SelectItem>
                <SelectItem value="other" className="text-xl">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="h-14 text-xl bg-gray-700 text-white border-neon-cyan focus:border-neon-cyan focus:ring-neon-cyan"
            />
            <Button type="submit" className="w-full h-14 text-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding; 