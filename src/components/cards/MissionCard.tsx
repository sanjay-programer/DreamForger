
import { cn } from '@/lib/utils';
import { Check, Clock, Trophy } from 'lucide-react';

interface MissionCardProps {
  title: string;
  description: string;
  xpReward: number;
  status: 'completed' | 'in-progress' | 'pending';
  colorAccent?: 'cyan' | 'magenta' | 'green' | 'purple';
}

export const MissionCard = ({
  title,
  description,
  xpReward,
  status,
  colorAccent = 'cyan'
}: MissionCardProps) => {
  const colorMap = {
    cyan: 'neon-border-cyan hover:neon-glow-cyan',
    magenta: 'neon-border-magenta hover:neon-glow-magenta',
    green: 'neon-border-green hover:neon-glow-green',
    purple: 'border-neon-purple hover:shadow-[0_0_5px_0px_theme(colors.neon.purple)]'
  };

  const statusIcon = {
    'completed': <Check className="w-5 h-5 text-neon-green" />,
    'in-progress': <Clock className="w-5 h-5 text-neon-cyan" />,
    'pending': <Clock className="w-5 h-5 text-gray-400" />
  };

  const statusText = {
    'completed': 'Completed',
    'in-progress': 'In Progress',
    'pending': 'Not Started'
  };

  return (
    <div 
      className={cn(
        "relative glassmorphism p-5 rounded-lg card-hover",
        colorMap[colorAccent]
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="flex items-center space-x-1">
          {statusIcon[status]}
          <span className="text-sm opacity-80">{statusText[status]}</span>
        </span>
      </div>
      
      <p className="text-sm opacity-80 mb-4">{description}</p>
      
      <div className="flex items-center justify-end">
        <div className="flex items-center">
          <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
          <span className="text-sm font-semibold text-yellow-500">+{xpReward} XP</span>
        </div>
      </div>
    </div>
  );
};
