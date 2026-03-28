import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  User, 
  Settings, 
  Sparkles,
  Loader2,
  ExternalLink,
  Edit3
} from "lucide-react";
import StudentGraphView from "./StudentGraphView"; // Adjust path if needed

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { springApi } from "@/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  // State to hold the data from your Spring Boot backend
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the data the moment the dashboard loads
// Fetch the data and setup polling if AI is not ready
useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchProfile = async () => {
      try {
        const response = await springApi.get("/profile/me");
        
        if (isMounted) {
          // 🚨 DEBUG: Print exactly what Spring Boot is sending!
          console.log("SPRING BOOT DATA:", response.data); 
          
          setProfile(response.data);
          setIsLoading(false);

          // Flexible check: Catch either 'aiReady' or 'isAiReady'
          const isReady = response.data.aiReady === true || response.data.isAiReady === true;

          // If not ready, poll again in 3 seconds
          if (!isReady) {
             timeoutId = setTimeout(fetchProfile, 3000);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (error.response?.status === 500 || error.response?.status === 404) {
             navigate("/onboarding");
        }
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  
  // Show a loading spinner while waiting for the database to respond
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Render the actual Dashboard once data is fetched
  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-wide">
            Trajectory<span className="text-blue-500">AI</span>
          </h1>
        </div>
        <nav className="flex-1 py-6 space-y-2 px-4">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-md transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
            <FileText size={20} /> My Resume
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
            <Briefcase size={20} /> Saved Jobs
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
            <User size={20} /> Profile
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
            <Settings size={20} /> Settings
          </a>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Row */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome to your Dashboard</h2>
            <p className="text-slate-500 mt-1">Manage your AI career profile and job matches.</p>
          </div>
          <Button variant="outline" className="bg-white hover:bg-slate-50 shadow-sm">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        {/* AI Status Banner (Shows if the Python worker hasn't finished yet) */}
        {!profile?.aiReady && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
              <div>
                <h4 className="font-semibold text-blue-900">Your profile is being vectorized!</h4>
                <p className="text-sm text-blue-700">Our AI workers are currently extracting advanced skills from your resume to match you with employers.</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Processing
            </Badge>
          </div>
        )}

        {/* Top Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Resume Preview Card */}
          <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200 bg-white">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600"/> 
                  Raw Extracted Text
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* This displays the actual text your Java backend pulled from the PDF! */}
              <div className="bg-slate-900 text-green-400 p-4 rounded-md h-[200px] overflow-y-auto text-xs font-mono shadow-inner whitespace-pre-wrap">
                {profile?.resumeText ? profile.resumeText : "No text was extracted. Please re-upload your resume."}
              </div>
            </CardContent>
          </Card>

          {/* Database Info Card */}
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">User ID / Primary Key</p>
                <Badge variant="secondary" className="font-mono text-sm bg-slate-100 text-slate-700">
                  {profile?.userId}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">MinIO Storage Bucket</p>
                {profile?.resumeUrl ? (
                  <a 
                    href={profile.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors p-2 bg-blue-50 rounded-md border border-blue-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Original PDF
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 italic">No file uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* --- FULL WIDTH GRAPH SECTION --- */}
        {profile?.userId && (
          <div className="w-full mb-8">
            <StudentGraphView userId={profile.userId} />
          </div>
        )}
        
      </main>
    </div>
  );
}