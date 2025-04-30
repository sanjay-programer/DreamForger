import { useEffect, useState } from 'react';
import { Starscape } from "@/components/Starscape";
import { Sidebar } from "@/components/Sidebar";
import { BarChart, Activity, Award, Zap, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@/components/ui/loading';

interface Skill {
  id: number;
  name: string;
  description: string;
  power: string;
}

interface UserDetails {
  name: string;
  age: number;
  education: string;
  dream: string | null;
}

interface ActivatedSkill {
  name: string;
  status: 'ongoing' | 'completed';
  progress: number;
  roadmap?: any[];
  tasks?: any[];
}

const Dashboard = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [activatedSkills, setActivatedSkills] = useState<ActivatedSkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activatingSkill, setActivatingSkill] = useState<string | null>(null);
  const { userId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/user/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserDetails(data.data);
        return data.data.dream;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const fetchUserProgress = async () => {
    try {
      console.log('Starting fetchUserProgress for user:', userId);
      
      const response = await fetch('http://127.0.0.1:8000/get_user_progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      console.log('Raw response from get_user_progress:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch user progress');
      }

      // Initialize with empty array if no data
      if (!data.data) {
        console.log('No data object in response, initializing with empty array');
        setActivatedSkills([]);
        return;
      }

      // Process activated skills if they exist
      const skillsArray = data.data.activated_skills 
        ? Object.entries(data.data.activated_skills).map(([name, status]) => {
            const skill: ActivatedSkill = {
              name,
              status: status as 'ongoing' | 'completed',
              progress: 0,
              roadmap: data.data.developing_skills?.[name] || [],
              tasks: []
            };

            // Process tasks if they exist
            if (data.data.ongoing_tasks && data.data.ongoing_tasks[name]) {
              const allTasks = Object.values(data.data.ongoing_tasks[name]).flat();
              skill.tasks = allTasks;
            }

            return skill;
          })
        : [];

      console.log('Processed skills array:', skillsArray);
      setActivatedSkills(skillsArray);
    } catch (error) {
      console.error('Error in fetchUserProgress:', error);
      // Instead of showing an error toast, just set empty array
      setActivatedSkills([]);
    }
  };

  const fetchSkills = async () => {
    try {
      const dream = await fetchUserDetails();
      if (!dream) {
        toast({
          title: "No Dream Set",
          description: "Please set your dream in the dream selection page",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/generate-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream }),
      });

      const data = await response.json();

      if (data.response && data.response.skills) {
        setSkills(data.response.skills);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch skills",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching skills",
        variant: "destructive",
      });
    }
  };

  const handleActivateSkill = async (skill: Skill) => {
    try {
      setActivatingSkill(skill.name);
      setIsLoading(true);
      console.log('Starting skill activation for:', skill.name);
      console.log('User ID:', userId);

      // First API call - Activate Skill
      const activateResponse = await fetch('http://127.0.0.1:8000/activate_skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          skill_name: skill.name,
          status: 'ongoing'
        }),
      });

      const activateData = await activateResponse.json();
      console.log('Activate Skill Response:', activateData);

      if (!activateResponse.ok) {
        throw new Error(activateData.detail || 'Failed to activate skill');
      }

      // Second API call - Generate Roadmap
      console.log('Generating roadmap for:', skill.name);
      const roadmapResponse = await fetch('http://127.0.0.1:8000/generate-skill-mastery-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill: skill.name }),
      });

      const roadmapData = await roadmapResponse.json();
      console.log('Roadmap Response:', roadmapData);

      if (!roadmapResponse.ok) {
        throw new Error('Failed to generate roadmap');
      }

      if (!roadmapData[skill.name]) {
        throw new Error('Invalid roadmap data received');
      }

      // Third API call - Store Roadmap
      console.log('Storing roadmap for:', skill.name);
      const storeRoadmapResponse = await fetch('http://127.0.0.1:8000/adding_skill_roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          skill_name: skill.name,
          roadmap: roadmapData[skill.name].map((stage: any) => ({
            ...stage,
            progress: 'incomplete'
          }))
        }),
      });

      const storeRoadmapData = await storeRoadmapResponse.json();
      console.log('Store Roadmap Response:', storeRoadmapData);

      if (!storeRoadmapResponse.ok) {
        throw new Error(storeRoadmapData.detail || 'Failed to store roadmap');
      }

      // Update UI and navigate
      setActivatedSkills(prev => [...prev, {
        name: skill.name,
        status: 'ongoing',
        progress: 0
      }]);

      toast({
        title: "Success",
        description: "Skill activated successfully!",
        variant: "default",
      });

      navigate(`/skill-roadmap/${encodeURIComponent(skill.name)}`);
    } catch (error) {
      console.error('Error in handleActivateSkill:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while activating the skill",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setActivatingSkill(null);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('Initializing dashboard...');
      await fetchUserDetails();
      await fetchUserProgress();
      await fetchSkills();
      console.log('Dashboard initialized. Activated skills:', activatedSkills);
    };

    initializeDashboard();
  }, [userId, toast]);

  // Add effect to log when activatedSkills changes
  useEffect(() => {
    console.log('Activated skills updated:', activatedSkills);
  }, [activatedSkills]);

  // Sample data
  const stats = [
    { label: "Learning Streaks", value: "12 days", icon: Activity, color: "neon-cyan" },
    { label: "XP Gained", value: "4,780", icon: BarChart, color: "neon-magenta" },
    { label: "Time Invested", value: "27 hours", icon: BarChart, color: "neon-green" }
  ];

  const achievements = [
    { name: "First Step", description: "Complete your first mission", unlocked: true },
    { name: "Consistency", description: "Maintain a 7-day streak", unlocked: true },
    { name: "Quick Learner", description: "Complete 10 missions", unlocked: true },
    { name: "Expert", description: "Reach Level 10", unlocked: false },
    { name: "Mastery", description: "Complete your dream roadmap", unlocked: false }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Starscape />
      <Sidebar />
      <div className="p-8 ml-64">
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Loading 
              variant="ai" 
              message={`AI is generating your ${activatingSkill} mastery roadmap...`} 
            />
          </div>
        )}
        <header className="mb-8">
          <h1 className="text-5xl font-bold neon-text-cyan mb-4">Dashboard</h1>
          <p className="text-2xl text-gray-400">Track your learning progress</p>
          {userDetails?.dream && (
            <p className="text-xl text-neon-magenta mt-2">
              Your Dream: <span className="font-bold">{userDetails.dream}</span>
            </p>
          )}
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="glassmorphism p-6 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-${stat.color}/20`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-xl text-gray-300">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activated Skills Section - Always visible */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold neon-text-green mb-6">Your Active Skills</h2>
          {activatedSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activatedSkills.map((skill) => (
                <div key={skill.name} className="glassmorphism p-6 rounded-lg hover:border-neon-green transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{skill.name}</h3>
                    <div className="flex items-center space-x-2">
                      {skill.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      ) : (
                        <Clock className="w-5 h-5 text-neon-cyan" />
                      )}
                      <span className={`text-sm ${skill.status === 'completed' ? 'text-neon-green' : 'text-neon-cyan'}`}>
                        {skill.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/skill-roadmap/${encodeURIComponent(skill.name)}`)}
                    className="w-full py-3 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 hover:from-neon-green/30 hover:to-neon-cyan/30 border border-neon-green rounded-lg transition-all duration-300 group-hover:scale-105"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold">Continue Learning</span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="glassmorphism p-8 rounded-lg text-center">
              <div className="w-20 h-20 mx-auto bg-neon-cyan/20 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-neon-cyan" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No Active Skills Yet</h3>
              <p className="text-xl text-gray-300 mb-6">
                Activate a skill from the Divine Skills section below to start your learning journey!
              </p>
            </div>
          )}
        </div>

        {/* Divine Skills Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold neon-text-magenta mb-6">Divine Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div key={skill.id} className="glassmorphism p-6 rounded-lg hover:border-neon-cyan transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{skill.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-neon-cyan" />
                    <span className="text-neon-cyan text-sm">{skill.power}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleActivateSkill(skill)}
                  className="w-full py-3 bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 hover:from-neon-cyan/30 hover:to-neon-magenta/30 border border-neon-cyan rounded-lg transition-all duration-300 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold">Activate Skill</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="text-4xl font-bold neon-text-purple mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="glassmorphism p-6 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${achievement.unlocked ? 'bg-neon-green/20' : 'bg-white/10'}`}>
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{achievement.name}</h3>
                    <p className="text-xl text-gray-300">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
