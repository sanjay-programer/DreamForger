import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  variant?: 'default' | 'ai' | 'simple';
  message?: string;
  className?: string;
}

export const Loading = ({ variant = 'default', message, className }: LoadingProps) => {
  const messages = {
    default: "Loading...",
    ai: "AI is generating your roadmap...",
    simple: "Please wait..."
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px]",
      className
    )}>
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-lg text-gray-400">
        {message || messages[variant]}
      </p>
    </div>
  );
}; 