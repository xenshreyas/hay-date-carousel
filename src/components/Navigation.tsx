import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, User, Plus, Home } from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-pink-600">
              🐎 Horse Tinder AI B2B SaaS
            </h1>
            <div className="hidden md:flex space-x-4">
              <Button
                variant={currentView === "home" ? "default" : "ghost"}
                onClick={() => onViewChange("home")}
                className="flex items-center space-x-2"
              >
                <Home size={16} />
                <span>Browse</span>
              </Button>
              <Button
                variant={currentView === "matches" ? "default" : "ghost"}
                onClick={() => onViewChange("matches")}
                className="flex items-center space-x-2"
              >
                <Heart size={16} />
                <span>Matches</span>
              </Button>
              <Button
                variant={currentView === "messages" ? "default" : "ghost"}
                onClick={() => onViewChange("messages")}
                className="flex items-center space-x-2"
              >
                <MessageCircle size={16} />
                <span>Messages</span>
              </Button>
              <Button
                variant={currentView === "horses" ? "default" : "ghost"}
                onClick={() => onViewChange("horses")}
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>My Horses</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}!
            </span>
            <Button
              variant={currentView === "profile" ? "default" : "ghost"}
              onClick={() => onViewChange("profile")}
            >
              <User size={16} />
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
