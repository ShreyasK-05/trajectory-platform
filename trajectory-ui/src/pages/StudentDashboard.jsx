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
  Target,
  Edit3
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { springApi, pythonApi } from "@/api"; // Importing both backends!

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get the user's profile and bio from Java
        const profileRes = await springApi.get("/profile/me");
        const userData = profileRes.data;
        setProfile(userData);

        // 2. If they have a profile, ask Python for their AI job matches
        if (userData?.userId) {
          setIsMatching(true);
          try {
            const matchRes = await pythonApi.get(`/match/user/${userData.userId}`);
            
            if (matchRes.data && matchRes.data.top_matches) {
              const rawMatches = matchRes.data.top_matches;
              
              // 3. ENRICHMENT: Ask Spring Boot for the Title & Description of each Job ID!
              const enrichedMatches = await Promise.all(
                rawMatches.map(async (match) => {
                  try {
                    const jobDetails = await springApi.get(`/jobs/${match.job_id}`);
                    return { ...match, jobData: jobDetails.data }; // Combine Python scores with Java data
                  } catch (e) {
                    console.error(`Failed to fetch details for Job ${match.job_id}`);
                    return { ...match, jobData: { title: "Unknown Job", description: "Details unavailable" } };
                  }
                })
              );
              
              setMatches(enrichedMatches);
            }
          } catch (matchErr) {
            console.error("AI matching is still processing or unavailable:", matchErr);
          } finally {
            setIsMatching(false);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (error.response?.status === 500 || error.response?.status === 404) {
             navigate("/onboarding");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your AI workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex">
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
          <Button variant="outline" className="bg-white hover:bg-slate-50 shadow-sm" onClick={() => navigate("/onboarding")}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        {/* Top Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Profile & Bio Card */}
          <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200 bg-white">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600"/> 
                Your Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 text-slate-700 p-4 rounded-md text-sm border border-slate-100 whitespace-pre-wrap">
                {profile?.bio ? profile.bio : "No bio provided yet. Click 'Edit Profile' to add one!"}
              </div>
            </CardContent>
          </Card>

          {/* AI Status & Matches Card */}
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4 bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI Job Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMatching ? (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Fetching vectors...
                </div>
              ) : matches.length > 0 ? (
                <ul className="space-y-3">
                  {matches.map((match, idx) => (
                    <li key={idx} className="flex flex-col p-3 hover:bg-slate-50 rounded-md border border-slate-100 transition-colors gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-500 mt-1" />
                          <div>
                            <span className="text-md font-bold text-slate-900 block">
                              {match.jobData?.title || `Job #${match.job_id}`}
                            </span>
                            <span className="text-xs text-slate-500 line-clamp-1">
                              {match.jobData?.description || "No description available"}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shrink-0">
                          {match.similarity_score}% Match
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-1 justify-between">
                        View Job Details <ExternalLink className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No matches generated yet. Make sure your resume is vectorized and jobs are posted!</p>
              )}
            </CardContent>
          </Card>

        </div>
        <div className="mt-8">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600"/> 
                  Extracted Resume Data
                </CardTitle>
                <CardDescription className="mt-1">
                  This is the raw text the AI engine uses to calculate your vector matches.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* Terminal-style window */}
              <div className="bg-slate-900 text-emerald-400 p-6 rounded-md text-sm border border-slate-800 whitespace-pre-wrap h-96 overflow-y-auto font-mono shadow-inner">
                {profile?.resumeText ? profile.resumeText : "No resume data found in the database."}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}