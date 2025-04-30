import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Starscape } from "@/components/Starscape";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft, Check, Lock, ChevronDown, Sparkles, Upload, Target, PartyPopper, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

interface Stage {
  stage: string;
  description: string;
  completed?: boolean;
  locked?: boolean;
  tasks?: Task[];
}

interface Task {
  task: string;
  description: string;
  proof: string;
  completed?: boolean;
}

const SkillRoadmap = () => {
  const { skillName } = useParams();
  const [stages, setStages] = useState<Stage[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [expandedStage, setExpandedStage] = useState<number | null>(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAuth();

  const fetchTasksForStage = async (stageIndex: number, stage: Stage) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: skillName,
          stage: stage.stage,
          description: stage.description
        }),
      });

      const data = await response.json();
      if (data.response && data.response.tasks) {
        setStages(prev => {
          const updated = [...prev];
          updated[stageIndex] = {
            ...updated[stageIndex],
            tasks: data.response.tasks.map((task: Task) => ({ ...task, completed: false }))
          };
          return updated;
        });

        // Store the tasks in the backend
        await fetch('http://127.0.0.1:8000/add_ongoing_tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            skill_name: skillName,
            stage_name: stage.stage,
            tasks: data.response.tasks.map((task: Task) => ({
              ...task,
              status: 'incomplete'
            }))
          }),
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/generate-skill-mastery-roadmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            skill: skillName
          }),
        });

        const data = await response.json();
        if (data[skillName!]) {
          const initializedStages = data[skillName!].map((stage: Stage, index: number) => ({
            ...stage,
            completed: index < currentStage,
            locked: index > currentStage,
            tasks: []
          }));
          setStages(initializedStages);
          
          // Fetch tasks for all unlocked stages
          initializedStages.forEach((stage, index) => {
            if (!stage.locked) {
              fetchTasksForStage(index, stage);
            }
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching roadmap",
          variant: "destructive",
        });
      }
    };

    fetchRoadmap();
  }, [skillName, currentStage, toast, userId]);

  // Initialize voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleStageClick = (stageIndex: number) => {
    if (stages[stageIndex].locked) {
      toast({
        title: "Stage Locked",
        description: "Complete the previous stages to unlock this one",
        variant: "destructive",
      });
      return;
    }
    setExpandedStage(expandedStage === stageIndex ? null : stageIndex);
  };

  const getRandomAppreciation = () => {
    const appreciations = [
      "Fantastic work! You're making great progress!",
      "Amazing job! Your dedication is inspiring!",
      "Incredible progress! You're really getting the hang of this!",
      "Outstanding achievement! You're on the right track!",
      "Brilliant work! Your skills are growing!",
      "You're on fire! Keep up this amazing momentum!",
      "Simply amazing! You're learning so quickly!",
      "You're crushing it! This is impressive!",
      "Unbelievable work! You're a natural at this!",
      "You're unstoppable! Your progress is remarkable!",
      "Excellent work! You're mastering this skill!",
      "Superb job! Your effort is paying off!",
      "Terrific progress! You're really getting it!",
      "Wonderful work! Your improvement is noticeable!",
      "Impressive achievement! You're doing great!"
    ];
    return appreciations[Math.floor(Math.random() * appreciations.length)];
  };

  const getNextTaskMessage = () => {
    const messages = [
      "Now, let's move on to your next challenge:",
      "Ready for your next task? Here it is:",
      "Time for your next mission:",
      "Your next objective awaits:",
      "Let's tackle your next goal:",
      "Moving forward, your next task is:",
      "Up next, you'll be working on:",
      "Your next step in this journey is:",
      "Prepare for your next challenge:",
      "Your next learning opportunity is:"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const speak = (text: string) => {
    if (isSpeaking || !voicesLoaded) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.rate = 0.9;
    speech.pitch = 1.1;
    speech.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const femaleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('zira')
    );
    
    if (femaleVoices.length > 0) {
      speech.voice = femaleVoices[0];
    } else if (voices.length > 0) {
      speech.voice = voices[0];
    }
    
    speech.onend = () => {
      setIsSpeaking(false);
    };
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const handleTaskComplete = async (stageIndex: number, taskIndex: number) => {
    try {
      const currentStage = stages[stageIndex];
      const currentTask = currentStage.tasks![taskIndex];

      // Update task status in backend
      await fetch('http://127.0.0.1:8000/update_ongoing_task_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          skill_name: skillName,
          stage_name: currentStage.stage,
          task_name: currentTask.task,
          new_status: 'completed'
        }),
      });

      setStages(prev => {
        const updated = [...prev];
        updated[stageIndex].tasks![taskIndex].completed = true;
        
        const allTasksCompleted = updated[stageIndex].tasks?.every(task => task.completed);
        if (allTasksCompleted) {
          updated[stageIndex].completed = true;
          if (stageIndex < updated.length - 1) {
            updated[stageIndex + 1].locked = false;
            fetchTasksForStage(stageIndex + 1, updated[stageIndex + 1]);
          }
          setCurrentStage(stageIndex + 1);
          setShowCompletion(true);

          // Update stage progress in backend
          fetch('http://127.0.0.1:8000/update_stage_progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              skill_name: skillName,
              stage_name: currentStage.stage,
              new_progress: 'completed'
            }),
          });

          // Check if all stages are completed
          const allStagesCompleted = updated.every(stage => stage.completed);
          if (allStagesCompleted) {
            // Update skill status to completed
            fetch('http://127.0.0.1:8000/update_skill_status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: userId,
                skill_name: skillName,
                new_status: 'completed'
              }),
            });
          }
          
          // Speak stage completion message
          setTimeout(() => {
            speak("Congratulations! You've completed this stage! What an amazing achievement! Your dedication and hard work have paid off!");
          }, 500);
          
          setTimeout(() => setShowCompletion(false), 3000);
        } else {
          // Move to next task
          setCurrentTaskIndex(taskIndex + 1);
          const nextTask = updated[stageIndex].tasks![taskIndex + 1];
          if (nextTask) {
            // Speak task completion and next task message
            setTimeout(() => {
              const appreciation = getRandomAppreciation();
              const nextTaskMessage = getNextTaskMessage();
              speak(`${appreciation} ${nextTaskMessage} ${nextTask.task}`);
            }, 500);
          }
        }
        
        return updated;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating progress",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Space Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-black to-navy-900">
        {/* Twinkling Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>
        {/* Nebula Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-neon-purple/10 to-neon-cyan/10 blur-3xl" />
        </div>
      </div>

      <Sidebar />
      <div className="flex-1 pl-[240px] p-8 relative">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg glassmorphism hover:bg-neon-cyan/20 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-5xl font-bold neon-text-cyan">Skill Roadmap</h1>
        </div>

        {showCompletion && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="glassmorphism p-8 rounded-lg text-center max-w-md mx-4">
              <div className="w-20 h-20 mx-auto bg-neon-green/20 rounded-full flex items-center justify-center mb-6">
                <PartyPopper className="w-10 h-10 text-neon-green" />
              </div>
              <h2 className="text-3xl font-bold mb-4 neon-text-green">Stage Completed!</h2>
              <p className="text-xl text-gray-300 mb-6">
                Congratulations! You've unlocked the next stage.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {stages.map((stage, stageIndex) => (
            <div key={stageIndex} className="relative group">
              {/* Stage Card */}
              <div
                className={cn(
                  "glassmorphism p-6 rounded-lg transition-all duration-300 relative overflow-hidden backdrop-blur-sm",
                  stage.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-neon-cyan",
                  stage.completed ? "border-neon-green" : "border-neon-cyan/20",
                  expandedStage === stageIndex && "border-neon-cyan scale-105",
                  !stage.completed && !stage.locked && "hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                )}
                onClick={() => handleStageClick(stageIndex)}
              >
                {/* Background Animation */}
                {!stage.completed && !stage.locked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-magenta/5 animate-pulse" />
                )}
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                      stage.completed ? "bg-neon-green/20" : 
                      stage.locked ? "bg-gray-500/20" : 
                      "bg-gradient-to-br from-neon-cyan/30 to-neon-magenta/30 group-hover:from-neon-cyan/40 group-hover:to-neon-magenta/40"
                    )}>
                      {stage.completed ? (
                        <Check className="w-7 h-7 text-neon-green" />
                      ) : stage.locked ? (
                        <Lock className="w-7 h-7 text-gray-500" />
                      ) : (
                        <div className="relative">
                          <span className="text-2xl font-bold">{stageIndex + 1}</span>
                          <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-neon-cyan animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold transition-all duration-300",
                        stage.completed ? "text-neon-green" : 
                        stage.locked ? "text-gray-500" : 
                        "text-white group-hover:text-neon-cyan"
                      )}>{stage.stage}</h3>
                      <p className={cn(
                        "text-gray-300 transition-all duration-300",
                        !stage.locked && "group-hover:text-neon-cyan/80"
                      )}>{stage.description}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "w-6 h-6 transition-all duration-300",
                    expandedStage === stageIndex ? "transform rotate-180 text-neon-cyan" : 
                    stage.locked ? "text-gray-500" : 
                    "text-neon-cyan/50 group-hover:text-neon-cyan"
                  )} />
                </div>
              </div>

              {/* Tasks Section */}
              {expandedStage === stageIndex && stage.tasks && (
                <div className="mt-4 ml-12 pl-6 border-l-2 border-neon-cyan/30 space-y-4">
                  {stage.tasks.map((task, taskIndex) => {
                    // Only show current and completed tasks
                    if (taskIndex > currentTaskIndex && !task.completed) return null;
                    
                    return (
                      <div
                        key={taskIndex}
                        className={cn(
                          "glassmorphism p-6 rounded-lg relative overflow-hidden transition-all duration-300 backdrop-blur-sm",
                          task.completed ? "border-neon-green" : "border-neon-cyan/20"
                        )}
                      >
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                task.completed ? "bg-neon-green/20" : "bg-neon-cyan/20"
                              )}>
                                {task.completed ? (
                                  <Check className="w-6 h-6 text-neon-green" />
                                ) : (
                                  <Target className="w-6 h-6 text-neon-cyan" />
                                )}
                              </div>
                              <h4 className={cn(
                                "text-xl font-bold",
                                task.completed ? "text-neon-green" : "text-white"
                              )}>{task.task}</h4>
                            </div>
                          </div>
                          <p className="text-lg text-gray-300 mb-4">{task.description}</p>
                          <div className="bg-white/5 p-4 rounded-lg mb-4">
                            <p className="text-lg text-gray-300">Proof Required: {task.proof}</p>
                          </div>
                        </div>

                        {!task.completed && (
                          <div className="relative z-10">
                            <input
                              type="file"
                              id={`file-upload-${stageIndex}-${taskIndex}`}
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  // Simulate file upload
                                  setTimeout(() => {
                                    handleTaskComplete(stageIndex, taskIndex);
                                    toast({
                                      title: "Task Completed!",
                                      description: "Great job! You've completed this task.",
                                      variant: "default",
                                    });
                                  }, 1000);
                                }
                              }}
                            />
                            <button
                              onClick={() => document.getElementById(`file-upload-${stageIndex}-${taskIndex}`)?.click()}
                              className="w-full px-6 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <Upload className="w-5 h-5 text-neon-cyan" />
                              <span className="text-neon-cyan">Upload</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Connection Line */}
              {stageIndex < stages.length - 1 && (
                <div className="absolute left-6 top-[calc(100%+1rem)] w-0.5 h-8 bg-gradient-to-b from-neon-cyan/30 to-neon-magenta/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillRoadmap; 