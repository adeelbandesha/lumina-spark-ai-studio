
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Save, LogOut, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profileData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!profileData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!profileData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await updateProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });
      
      if (success) {
        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 rounded-lg bg-slate-800/50 backdrop-blur-lg border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fade-in">
                Profile Settings
              </h1>
              <p className="text-slate-300 animate-fade-in animation-delay-200">Manage your account settings and preferences</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-200 transform hover:scale-105"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-2xl shadow-purple-500/20 animate-scale-in">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-1 bg-slate-700/50 border-slate-600">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile Information
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <p className="text-slate-300">Update your personal details and contact information.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-slate-300">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="first_name"
                          name="first_name"
                          type="text"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className={`pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50 transition-all duration-300 ${
                            errors.first_name ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {errors.first_name && (
                          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {errors.first_name && (
                        <p className="text-sm text-red-400 flex items-center animate-fade-in">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-slate-300">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="last_name"
                          name="last_name"
                          type="text"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className={`pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50 transition-all duration-300 ${
                            errors.last_name ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {errors.last_name && (
                          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {errors.last_name && (
                        <p className="text-sm text-red-400 flex items-center animate-fade-in">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        className="pl-10 bg-slate-600/50 border-slate-500 text-slate-400 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-slate-500">Email address cannot be changed</p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-400">
                      <p>Member since: {new Date(user.id).toLocaleDateString()}</p>
                      <p>User ID: {user.id}</p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Updating...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
