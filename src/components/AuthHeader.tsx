
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AuthHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/login">
          <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-all duration-200 transform hover:scale-105">
            Sign In
          </Button>
        </Link>
        <Link to="/signup">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-slate-300">{user.first_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-slate-800/95 backdrop-blur-lg border-slate-700/50 shadow-2xl z-50"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white">{user.first_name} {user.last_name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-slate-700/50" />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/profile" className="flex items-center text-slate-300 hover:text-white transition-colors duration-200">
            <User className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700/50" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthHeader;
