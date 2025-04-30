
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SkillProgressCardProps {
  name: string;
  progress: number;
  colorAccent?: 'cyan' | 'magenta' | 'green' | 'purple';
}

export const SkillProgressCard = ({
  name,
  progress,
  colorAccent = 'cyan'
}: SkillProgressCardProps) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  
  useEffect(() => {
    // Create animation effect for progress
    const timeout = setTimeout(() => {
      setCurrentProgress(progress);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [progress]);
  
  const colorMap = {
    cyan: 'from-neon-cyan/20 to-neon-cyan/5 text-neon-cyan',
    magenta: 'from-neon-magenta/20 to-neon-magenta/5 text-neon-magenta',
    green: 'from-neon-green/20 to-neon-green/5 text-neon-green',
    purple: 'from-neon-purple/20 to-neon-purple/5 text-neon-purple'
  };

  const progressColor = {
    cyan: 'bg-neon-cyan',
    magenta: 'bg-neon-magenta',
    green: 'bg-neon-green',
    purple: 'bg-neon-purple'
  };
  
  return (
    <div className={cn(
      "glassmorphism p-4 rounded-lg bg-gradient-to-br",
      colorMap[colorAccent]
    )}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{name}</h3>
        <span className="text-sm font-semibold">{currentProgress}%</span>
      </div>
      
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            progressColor[colorAccent]
          )}
          style={{ width: `${currentProgress}%` }}
        />
      </div>
    </div>
  );
};
