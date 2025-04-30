import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Starscape } from "@/components/Starscape";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft, Check, Upload, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Task {
  task: string;
  description: string;
  proof: string;
  completed?: boolean;
}

const SkillTasks = () => {
  const { skillName, stageName } = useParams();
  const { state } = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/generate-tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            skill: skillName,
            stage: stageName,
            description: state?.description || ''
          }),
        });

        const data = await response.json();
        if (data.response && data.response.tasks) {
          setTasks(data.response.tasks.map((task: Task) => ({ ...task, completed: false })));
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch tasks",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching tasks",
          variant: "destructive",
        });
      }
    };

    fetchTasks();
  }, [skillName, stageName, state?.description, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmitProof = () => {
    if (!proofFile) {
      toast({
        title: "No Proof Uploaded",
        description: "Please upload your proof of completion",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically upload the file to your backend
    // For now, we'll just simulate the upload
    setTimeout(() => {
      const updatedTasks = [...tasks];
      updatedTasks[currentTask].completed = true;
      setTasks(updatedTasks);
      setProofFile(null);
      setShowCompletion(true);

      if (currentTask < tasks.length - 1) {
        setCurrentTask(currentTask + 1);
      } else {
        // All tasks completed
        state?.onComplete?.();
        toast({
          title: "Stage Completed!",
          description: "You've completed all tasks in this stage",
          variant: "default",
        });
        setTimeout(() => navigate(-1), 2000);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 pl-[240px] p-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg glassmorphism hover:bg-neon-cyan/20 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-5xl font-bold neon-text-cyan">Stage Tasks</h1>
        </div>

        {showCompletion ? (
          <div className="glassmorphism p-8 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto bg-neon-green/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-neon-green" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Task Completed!</h2>
            <p className="text-xl text-gray-300 mb-6">
              Great job! You've successfully completed this task.
            </p>
            <button
              onClick={() => setShowCompletion(false)}
              className="px-6 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan rounded-lg transition-all duration-300"
            >
              Continue to Next Task
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={cn(
                  "glassmorphism p-6 rounded-lg",
                  index === currentTask ? "border-neon-cyan" : "opacity-50"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{task.task}</h3>
                  {task.completed && <Check className="w-6 h-6 text-neon-green" />}
                </div>
                <p className="text-gray-300 mb-4">{task.description}</p>
                {index === currentTask && (
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Proof Required:</h4>
                      <p className="text-gray-300">{task.proof}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1">
                        <div className="flex items-center justify-center space-x-2 p-4 border border-dashed border-neon-cyan rounded-lg cursor-pointer hover:bg-neon-cyan/10 transition-all duration-300">
                          <Upload className="w-5 h-5" />
                          <span>{proofFile ? proofFile.name : "Upload Proof"}</span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <button
                        onClick={handleSubmitProof}
                        disabled={!proofFile}
                        className={cn(
                          "px-6 py-4 rounded-lg transition-all duration-300",
                          proofFile
                            ? "bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan"
                            : "bg-white/10 cursor-not-allowed"
                        )}
                      >
                        Submit Proof
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTasks; 