import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Starscape } from '@/components/Starscape';
import { Sidebar } from "@/components/Sidebar";
import { Check, Clock, Sparkles, BookOpen, GraduationCap, Stethoscope, Wrench, Save, X, Edit2, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import Mentor from '@/components/Mentor';
import { Loading } from '@/components/ui/loading';

interface RoadmapPhase {
  [key: string]: string;
}

interface RoadmapData {
  dream: string;
  location: string;
  phases: RoadmapPhase[];
}

const PhaseIcon = ({ index }: { index: number }) => {
  const icons = [
    <BookOpen className="w-6 h-6" />,
    <GraduationCap className="w-6 h-6" />,
    <Stethoscope className="w-6 h-6" />,
    <Wrench className="w-6 h-6" />
  ];
  return icons[index % icons.length];
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-8">
    <motion.div 
      className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>
);

const AnimatedCheckbox = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled: boolean }) => (
  <motion.button
    onClick={onChange}
    disabled={disabled}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className={cn(
      "w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
      checked 
        ? "border-green-500 bg-green-500" 
        : "border-gray-400 hover:border-cyan-500",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <AnimatePresence>
      {checked && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.2 }}
        >
          <Check className="w-6 h-6 text-black" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

const NotesSection = ({ 
  isOpen, 
  notes, 
  onSave, 
  onClose 
}: { 
  isOpen: boolean; 
  notes: string; 
  onSave: (notes: string) => void; 
  onClose: () => void;
}) => {
  const [localNotes, setLocalNotes] = useState(notes);

  useEffect(() => {
    if (isOpen) {
      setLocalNotes(notes);
    }
  }, [isOpen, notes]);

  const handleClose = () => {
    setLocalNotes(notes);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Add Notes</h3>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full p-4 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 min-h-[200px] text-lg"
            />
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSave(localNotes);
                  onClose();
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Notes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showNotes, setShowNotes] = useState<number | null>(null);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();

  // Audio context ref
  const audioContext = useRef<AudioContext | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize audio context
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    const fetchUserData = async () => {
      try {
        // Fetch current user details including dream and location
        const response = await fetch('http://127.0.0.1:8000/user/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });

        const userData = await response.json();
        
        if (userData.success) {
          // Generate new roadmap with current dream and location
          const roadmapResponse = await fetch('http://127.0.0.1:8000/generate_roadmap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dream: userData.data.dream,
              location: userData.data.location,
            }),
          });

          const roadmapData = await roadmapResponse.json();
          
          if (roadmapData.phases) {
            // Store the new roadmap data
            localStorage.setItem('roadmapData', JSON.stringify(roadmapData));
            setRoadmapData(roadmapData);
          } else {
            throw new Error('Failed to generate roadmap');
          }
        } else {
          navigate('/dream-selection');
        }
      } catch (error) {
        console.error('Error fetching user data or generating roadmap:', error);
        toast({
          title: "Error",
          description: "Failed to generate roadmap. Please try again.",
          variant: "destructive",
        });
        navigate('/dream-selection');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Cleanup
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [navigate, userId, toast]);

  const playSuccessSound = () => {
    if (isMuted || !audioContext.current) return;

    const now = audioContext.current.currentTime;
    const duration = 0.5;

    // Create multiple oscillators for a richer sound
    const oscillators = [
      { type: 'sine', frequency: 880, gain: 0.05 },    // A5
      { type: 'sine', frequency: 1108.73, gain: 0.03 }, // C#6
      { type: 'sine', frequency: 1318.51, gain: 0.02 }  // E6
    ];

    oscillators.forEach(({ type, frequency, gain }) => {
      const oscillator = audioContext.current!.createOscillator();
      const gainNode = audioContext.current!.createGain();

      oscillator.type = type as OscillatorType;
      oscillator.frequency.setValueAtTime(frequency, now);
      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current!.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  };

  const playCelebrationSound = () => {
    if (isMuted || !audioContext.current) return;

    const now = audioContext.current.currentTime;
    const duration = 0.15;

    // Create a sequence of celebratory chords
    const chords = [
      [1046.50, 1318.51, 1567.98], // C6, E6, G6
      [1174.66, 1396.91, 1760.00], // D6, F6, A6
      [1318.51, 1567.98, 1975.53], // E6, G6, B6
      [1396.91, 1760.00, 2093.00]  // F6, A6, C7
    ];

    chords.forEach((chord, index) => {
      const chordTime = now + index * duration;

      chord.forEach((frequency, noteIndex) => {
        const oscillator = audioContext.current!.createOscillator();
        const gainNode = audioContext.current!.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, chordTime);
        
        // Create a more dynamic volume envelope
        gainNode.gain.setValueAtTime(0, chordTime);
        gainNode.gain.linearRampToValueAtTime(0.1, chordTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, chordTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current!.destination);

        oscillator.start(chordTime);
        oscillator.stop(chordTime + duration);
      });
    });

    // Add a final flourish
    setTimeout(() => {
      const flourishTime = now + chords.length * duration;
      const flourishFreqs = [2093.00, 2349.32, 2637.02, 2793.83]; // C7, D7, E7, F7

      flourishFreqs.forEach((frequency, index) => {
        const oscillator = audioContext.current!.createOscillator();
        const gainNode = audioContext.current!.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, flourishTime + index * 0.1);
        gainNode.gain.setValueAtTime(0.15, flourishTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, flourishTime + index * 0.1 + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current!.destination);

        oscillator.start(flourishTime + index * 0.1);
        oscillator.stop(flourishTime + index * 0.1 + 0.3);
      });
    }, 0);
  };

  const handlePhaseComplete = async (phaseIndex: number) => {
    if (isCompleting) return;
    setIsCompleting(true);
    
    try {
      // Play success sound and trigger confetti
      playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (phaseIndex < (roadmapData?.phases.length || 0) - 1) {
        setCurrentPhase(phaseIndex + 1);
        toast({
          title: "Success",
          description: "Phase completed! Moving to next phase.",
        });
      } else {
        // Play celebration sound and full confetti
        playCelebrationSound();
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 }
        });
        toast({
          title: "Congratulations!",
          description: "You've completed all phases of your roadmap!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing phase:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating progress.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 pl-[240px] p-8">
          <Loading variant="ai" message="AI is generating your personalized roadmap..." />
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return <div>Loading...</div>;
  }

  const progress = (currentPhase / roadmapData.phases.length) * 100;

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Sidebar />
      <div className="flex-1 pl-[240px] p-8">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Your Learning Roadmap
          </h1>
          <p className="text-2xl text-gray-400">Track your progress on the path to mastery</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-lg bg-gray-800/50 border border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-4xl text-white">Your Roadmap to {roadmapData.dream}</CardTitle>
              <CardDescription className="text-xl text-gray-300">
                Location: {roadmapData.location}
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <ProgressBar progress={progress} />

        <div className="space-y-8">
          {roadmapData.phases.map((phase, index) => {
            const phaseTitle = phase[`phase ${index + 1}`];
            const isCurrentPhase = index === currentPhase;
            const isCompleted = index < currentPhase;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "backdrop-blur-lg bg-gray-800/50 border transition-all duration-500 hover:scale-[1.02]",
                    isCompleted ? "border-green-500/50 shadow-lg shadow-green-500/20" :
                    isCurrentPhase ? "border-cyan-500/50 shadow-lg shadow-cyan-500/20" :
                    "border-white/10"
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <PhaseIcon index={index} />
                      <CardTitle className="text-2xl text-white">
                        Phase {index + 1}: {phaseTitle}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-4">
                      <AnimatedCheckbox
                        checked={isCompleted}
                        onChange={() => isCurrentPhase && handlePhaseComplete(index)}
                        disabled={!isCurrentPhase || isCompleting}
                      />
                      <Button
                        variant="ghost"
                        onClick={() => setShowNotes(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-5 h-5 mr-2" />
                        Notes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-300 mb-4">{phase.description}</p>
                    {isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center text-green-500 mt-2"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        <span>Completed</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <NotesSection
          isOpen={showNotes !== null}
          notes={showNotes !== null ? notes[showNotes] || '' : ''}
          onSave={(newNotes) => {
            if (showNotes !== null) {
              setNotes(prev => ({ ...prev, [showNotes]: newNotes }));
            }
          }}
          onClose={() => setShowNotes(null)}
        />

        <Mentor
          userId={userId}
          dream={roadmapData.dream}
          location={roadmapData.location}
        />
      </div>
    </div>
  );
};

export default Roadmap;
