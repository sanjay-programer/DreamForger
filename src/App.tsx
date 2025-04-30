import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import DreamSelection from "./pages/DreamSelection";
import Personality from "./pages/Personality";
import Settings from "./pages/Settings";
import Index from "./pages/Index";
import Roadmap from "./pages/Roadmap";
import Dashboard from "./pages/Dashboard";
import Buddies from "./pages/Buddies";
import NotFound from "./pages/NotFound";
import SkillRoadmap from "./pages/SkillRoadmap";
import SkillTasks from "./pages/SkillTasks";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dream-selection" element={<ProtectedRoute><DreamSelection /></ProtectedRoute>} />
      <Route path="/personality" element={<ProtectedRoute><Personality /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
      <Route path="/buddies" element={<ProtectedRoute><Buddies /></ProtectedRoute>} />
      <Route path="/skill-roadmap/:skillName" element={<ProtectedRoute><SkillRoadmap /></ProtectedRoute>} />
      <Route path="/skill-tasks/:skillName/:stageName" element={<ProtectedRoute><SkillTasks /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
