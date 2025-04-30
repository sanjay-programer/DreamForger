import { useState, useEffect } from "react";
import { Starscape } from "@/components/Starscape";
import { Sidebar } from "@/components/Sidebar";
import { MissionCard } from "@/components/cards/MissionCard";
import { SkillProgressCard } from "@/components/cards/SkillProgressCard";
import { MentorCard } from "@/components/cards/MentorCard";
import { Onboarding } from "@/components/Onboarding";
import { DreamProgressMeter } from "@/components/DreamProgressMeter";
import { Sparkles } from "lucide-react";

interface Skill {
  id: number;
  name: string;
}

interface OnboardingFormData {
  skills: Skill[];
  [key: string]: any;
}

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const handleOnboardingComplete = (formData: OnboardingFormData) => {
    setShowOnboarding(false);
    setSkills(formData.skills);
  };

  // Sample mission data
  const missions = [
    {
      id: 1,
      title: "Complete Learning Module",
      description: "Watch the introductory video and complete the assignment on AI fundamentals.",
      xpReward: 50,
      status: "in-progress" as const,
      colorAccent: "cyan" as const
    },
    {
      id: 2,
      title: "Practice Coding Challenge",
      description: "Solve the algorithm challenge and submit your solution for review.",
      xpReward: 75,
      status: "pending" as const,
      colorAccent: "magenta" as const
    },
    {
      id: 3,
      title: "Research Industry Trends",
      description: "Research and write a summary of current industry trends in your field.",
      xpReward: 60,
      status: "completed" as const,
      colorAccent: "green" as const
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Animated starscape background */}
      <Starscape />
      
      {/* Onboarding modal */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {/* Floating progress meter */}
      <DreamProgressMeter level={7} xpCurrent={4780} xpTarget={6000} />
      
      {/* Navigation sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="pl-[240px] p-8">
        {/* Header section */}
        <header className="mb-8">
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold mr-2">Welcome, Dreamer</h1>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-gray-400">Continue your journey to mastery</p>
        </header>
        
        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Today's missions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold mb-4 neon-text-cyan">Today's Missions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  title={mission.title}
                  description={mission.description}
                  xpReward={mission.xpReward}
                  status={mission.status}
                  colorAccent={mission.colorAccent}
                />
              ))}
            </div>
            
            {/* Skill growth section */}
            <h2 className="text-xl font-bold mt-8 mb-4 neon-text-magenta">Skill Growth</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <SkillProgressCard
                  key={skill.id}
                  name={skill.name}
                  progress={Math.floor(Math.random() * 100)} // You can replace this with actual progress data
                  colorAccent="cyan"
                />
              ))}
            </div>
          </div>
          
          {/* Right panel - Mentor and stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 neon-text-purple">Your Guide</h2>
            <MentorCard />
            
            {/* Quick stats */}
            <div className="glassmorphism p-5 rounded-lg mt-6">
              <h2 className="text-lg font-bold mb-4">Dream Progress</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Current Level</span>
                  <span className="font-bold">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Streak</span>
                  <span className="font-bold">12 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Total XP</span>
                  <span className="font-bold">4,780</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Missions Completed</span>
                  <span className="font-bold">23/45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
