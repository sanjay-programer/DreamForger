
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MentorCard = () => {
  return (
    <div className="glassmorphism neon-border-purple p-5 rounded-lg card-hover">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full overflow-hidden flex items-center justify-center">
            <span className="text-xl font-bold">AI</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-cosmic-black"></div>
        </div>
        <div>
          <h3 className="font-bold text-lg">Dream Mentor</h3>
          <p className="text-sm text-gray-300">Always available</p>
        </div>
      </div>
      
      <p className="text-sm opacity-80 mb-4">
        Have a question or need guidance on your journey? Your AI mentor is here to help!
      </p>
      
      <button
        className={cn(
          "w-full flex items-center justify-center space-x-2",
          "py-2 px-4 rounded-lg transition-all duration-300",
          "bg-neon-purple/20 hover:bg-neon-purple/30",
          "border border-neon-purple hover:neon-glow-purple"
        )}
      >
        <MessageSquare className="w-5 h-5" />
        <span>Chat with Mentor</span>
      </button>
    </div>
  );
};
