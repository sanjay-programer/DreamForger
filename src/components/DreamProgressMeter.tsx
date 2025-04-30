
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";
import { useState } from "react";

interface DreamProgressMeterProps {
  level: number;
  xpCurrent: number;
  xpTarget: number;
}

export const DreamProgressMeter = ({
  level,
  xpCurrent,
  xpTarget
}: DreamProgressMeterProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const progressPercentage = Math.min((xpCurrent / xpTarget) * 100, 100);
  
  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-40 transition-all duration-300 transform",
        expanded ? "scale-100" : "scale-90 hover:scale-95"
      )}
    >
      <div 
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Circular progress meter */}
        <div className="w-16 h-16 rounded-full glassmorphism-dark flex items-center justify-center border border-neon-cyan neon-glow-cyan">
          <svg className="w-14 h-14" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#18FFFF"
              strokeWidth="3"
              strokeDasharray={`${progressPercentage}, 100`}
              strokeDashoffset="25"
              strokeLinecap="round"
            />
            <text
              x="18"
              y="19"
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {level}
            </text>
          </svg>
        </div>
        
        {/* Expanded details panel */}
        <div 
          className={cn(
            "absolute bottom-full right-0 mb-3 glassmorphism-dark rounded-lg p-4 w-64 border border-neon-cyan transition-all duration-300",
            expanded ? "opacity-100 transform translate-y-0" : "opacity-0 pointer-events-none transform translate-y-3"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold">Dream Progress</h4>
            <span className="text-sm text-neon-cyan">Level {level}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>XP Progress</span>
              <span>{xpCurrent} / {xpTarget}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neon-cyan rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Daily Streak</span>
            <span>12 days</span>
          </div>
        </div>
      </div>
      
      {/* Brain button */}
      <div 
        className={cn(
          "absolute -left-12 bottom-0 w-10 h-10 rounded-full glassmorphism-dark flex items-center justify-center cursor-pointer border border-neon-magenta transition-all duration-300",
          expanded ? "opacity-100" : "opacity-0"
        )}
        onClick={() => console.log("Brain button clicked")}
      >
        <Brain className="w-5 h-5 text-neon-magenta" />
      </div>
    </div>
  );
};
