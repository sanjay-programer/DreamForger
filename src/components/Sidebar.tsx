import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Map,
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <li
      onClick={onClick}
      className={cn(
        "flex items-center w-full py-3 px-4 rounded-lg cursor-pointer transition-all duration-300 group",
        isActive 
          ? "bg-sidebar-accent text-neon-cyan neon-glow-cyan" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon 
        className={cn(
          "w-5 h-5 mr-3",
          isActive ? "text-neon-cyan" : "text-sidebar-foreground group-hover:text-neon-cyan"
        )}
      />
      <span className="font-medium">{label}</span>
    </li>
  );
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { id: "roadmap", icon: Map, label: "Roadmap", path: "/roadmap" },
    { id: "buddies", icon: Users, label: "Buddies", path: "/buddies" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" }
  ];

  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => currentPath.startsWith(item.path));
    return activeItem?.id || "dashboard";
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar-background glassmorphism-dark border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-bold text-white neon-text-cyan">
            DreamForge
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-sidebar-accent/50 transition-all duration-300"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={collapsed ? "" : item.label}
              isActive={getActiveItem() === item.id}
              onClick={() => navigate(item.path)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
