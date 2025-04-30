import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Check, Rocket, Brain, User, Clock, Palette, Zap, Plus } from 'lucide-react';

interface DreamOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Skill {
  id: number;
  name: string;
}

interface PersonalityTrait {
  id: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
}

interface OnboardingProps {
  onComplete: (formData: any) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education: '',
    budget: '',
    selectedDream: '',
    customDream: '',
    skills: [] as Skill[],
    personality: {
      introvertExtrovert: 50,
      practicalCreative: 50,
      analyticalIntuitive: 50,
      structuredFlexible: 50,
    }
  });
  
  const dreamOptions: DreamOption[] = [
    { id: 'developer', name: 'Developer', icon: <Rocket className="w-8 h-8" /> },
    { id: 'doctor', name: 'Doctor', icon: <User className="w-8 h-8" /> },
    { id: 'youtuber', name: 'YouTuber', icon: <Zap className="w-8 h-8" /> },
    { id: 'designer', name: 'Designer', icon: <Palette className="w-8 h-8" /> },
    { id: 'scientist', name: 'Scientist', icon: <Brain className="w-8 h-8" /> },
    { id: 'chef', name: 'Chef', icon: <Clock className="w-8 h-8" /> },
    { id: 'custom', name: 'Custom Dream', icon: <Plus className="w-8 h-8" /> },
  ];
  
  const personalityTraits: PersonalityTrait[] = [
    {
      id: 'introvertExtrovert',
      title: 'Social Energy',
      leftLabel: 'Introvert',
      rightLabel: 'Extrovert',
      value: formData.personality.introvertExtrovert,
      leftIcon: <User className="w-6 h-6" />,
      rightIcon: <User className="w-6 h-6" />
    },
    {
      id: 'practicalCreative',
      title: 'Approach',
      leftLabel: 'Practical',
      rightLabel: 'Creative',
      value: formData.personality.practicalCreative,
      leftIcon: <Zap className="w-6 h-6" />,
      rightIcon: <Palette className="w-6 h-6" />
    },
    {
      id: 'analyticalIntuitive',
      title: 'Decision Making',
      leftLabel: 'Analytical',
      rightLabel: 'Intuitive',
      value: formData.personality.analyticalIntuitive,
      leftIcon: <Brain className="w-6 h-6" />,
      rightIcon: <Zap className="w-6 h-6" />
    },
    {
      id: 'structuredFlexible',
      title: 'Work Style',
      leftLabel: 'Structured',
      rightLabel: 'Flexible',
      value: formData.personality.structuredFlexible,
      leftIcon: <Clock className="w-6 h-6" />,
      rightIcon: <Rocket className="w-6 h-6" />
    }
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDreamSelection = async (dreamId: string) => {
    if (dreamId === 'custom') {
      setFormData({
        ...formData,
        selectedDream: dreamId
      });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream: dreamId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      const data = await response.json();
      setFormData({
        ...formData,
        selectedDream: dreamId,
        skills: data.response.skills
      });
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };
  
  const handleCustomDreamSubmit = async () => {
    if (!formData.customDream.trim()) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream: formData.customDream }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      const data = await response.json();
      setFormData({
        ...formData,
        skills: data.response.skills
      });
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };
  
  const handlePersonalityChange = (traitId: string, value: number) => {
    setFormData({
      ...formData,
      personality: {
        ...formData.personality,
        [traitId]: value
      }
    });
  };
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const steps = [
    {
      title: "Welcome to DreamForge",
      description: "Let's get to know you better to create your personalized learning journey."
    },
    {
      title: "Choose Your Dream",
      description: "What would you like to become? Select your dream career path."
    },
    {
      title: "Personality Profile",
      description: "Let us know your preferences to customize your learning experience."
    },
    {
      title: "Ready for Liftoff",
      description: "Your dream journey is about to begin. Are you ready?"
    }
  ];
  
  const renderProgressIndicator = () => (
    <div className="flex justify-center space-x-2 mb-8">
      {steps.map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            idx === step 
              ? "w-8 bg-neon-cyan" 
              : idx < step 
                ? "w-8 bg-neon-green" 
                : "w-4 bg-white/30"
          )}
        />
      ))}
    </div>
  );
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Full Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="glassmorphism w-full mt-1 p-3 rounded-lg border-white/20 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan bg-transparent"
                  placeholder="Enter your name"
                />
              </label>
              
              <label className="block text-sm font-medium">
                Age
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="glassmorphism w-full mt-1 p-3 rounded-lg border-white/20 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan bg-transparent"
                  placeholder="Your age"
                />
              </label>
              
              <label className="block text-sm font-medium">
                Education Level
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="glassmorphism w-full mt-1 p-3 rounded-lg border-white/20 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan bg-transparent"
                  placeholder="e.g., High School, Bachelor's"
                />
              </label>
              
              <label className="block text-sm font-medium">
                Learning Budget (optional)
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="glassmorphism w-full mt-1 p-3 rounded-lg border-white/20 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan bg-transparent"
                  placeholder="Monthly budget for learning resources"
                />
              </label>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dreamOptions.map((dream) => (
                <div
                  key={dream.id}
                  className={cn(
                    "glassmorphism p-6 rounded-lg text-center cursor-pointer transition-all duration-300",
                    formData.selectedDream === dream.id 
                      ? "neon-border-cyan neon-glow-cyan" 
                      : "border border-white/20 hover:border-white/50"
                  )}
                  onClick={() => handleDreamSelection(dream.id)}
                >
                  <div className="flex justify-center mb-3">
                    {dream.icon}
                  </div>
                  <h3 className="font-medium">{dream.name}</h3>
                  
                  {formData.selectedDream === dream.id && (
                    <div className="absolute -top-2 -right-2 bg-neon-cyan rounded-full p-1">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {formData.selectedDream === 'custom' && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="customDream"
                    value={formData.customDream}
                    onChange={handleInputChange}
                    className="glassmorphism flex-1 p-3 rounded-lg border-white/20 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan bg-transparent"
                    placeholder="Enter your dream career"
                  />
                  <button
                    onClick={handleCustomDreamSubmit}
                    className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan rounded-lg transition-all duration-300"
                  >
                    Submit
                  </button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Skills generated for your custom dream!
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-8">
            {personalityTraits.map((trait) => (
              <div key={trait.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{trait.title}</h3>
                  <span className="text-sm opacity-70">
                    {trait.value < 40 ? trait.leftLabel : 
                     trait.value > 60 ? trait.rightLabel : 
                     "Balanced"}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 flex justify-center">{trait.leftIcon}</div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={trait.value}
                    onChange={(e) => handlePersonalityChange(trait.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan"
                  />
                  
                  <div className="w-8 flex justify-center">{trait.rightIcon}</div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-neon-cyan/20 rounded-full flex items-center justify-center neon-border-cyan">
              <Rocket className="w-10 h-10 text-neon-cyan" />
            </div>
            
            <div>
              <p className="text-lg">
                Your personalized learning journey has been created!
              </p>
              <p className="mt-2 opacity-70">
                Click "Start Journey" to begin your adventure into mastering {
                  dreamOptions.find(d => d.id === formData.selectedDream)?.name || "your dream"
                }.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-cosmic-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glassmorphism-dark rounded-xl p-8 border border-white/10">
        {renderProgressIndicator()}
        
        <h2 className="text-2xl font-bold mb-2 neon-text-cyan">{steps[step].title}</h2>
        <p className="text-gray-400 mb-8">{steps[step].description}</p>
        
        {renderStep()}
        
        <div className="flex justify-between mt-10">
          <button
            onClick={handleBack}
            className={cn(
              "flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-300",
              step > 0 
                ? "bg-white/10 hover:bg-white/20" 
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 py-2 px-6 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan hover:neon-glow-cyan transition-all duration-300"
          >
            <span>{step === steps.length - 1 ? "Start Journey" : "Next"}</span>
            {step < steps.length - 1 ? <ChevronRight className="w-5 h-5" /> : null}
          </button>
        </div>
      </div>
    </div>
  );
};
