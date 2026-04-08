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
import StudentGraphView from "./StudentGraphView"; // Adjust path if needed

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { springApi, pythonApi } from "@/api"; // Importing both backends!

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    if (profile?.userId) {
      const saved = localStorage.getItem(`saved_jobs_${profile.userId}`);
      if (saved) setSavedJobs(JSON.parse(saved));
    }
  }, [profile?.userId]);

  const handleSaveJob = (job) => {
    if (!profile?.userId || !job) return;
    const newSaved = [...savedJobs, job];
    setSavedJobs(newSaved);
    localStorage.setItem(`saved_jobs_${profile.userId}`, JSON.stringify(newSaved));
    toast.success("Job saved successfully!");
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchDashboardData = async () => {
      try {
        const profileRes = await springApi.get("/profile/me");
        const userData = profileRes.data;

        if (isMounted) {
          setProfile(userData);
          setIsLoading(false);

          const isReady = userData.aiReady === true || userData.isAiReady === true;

          // If aiReady is false, poll again
          if (!isReady) {
            timeoutId = setTimeout(fetchDashboardData, 3000);
          } else if (userData?.userId && !isMatching && matches.length === 0) {
            // AI is ready, let's fetch jobs
            setIsMatching(true);
            try {
              const matchRes = await pythonApi.get(`/match/user/${userData.userId}`);
              if (matchRes.data && matchRes.data.top_matches) {
                const rawMatches = matchRes.data.top_matches;
                const enrichedMatches = await Promise.all(
                  rawMatches.map(async (match) => {
                    try {
                      const jobDetails = await springApi.get(`/jobs/${match.job_id}`);
                      return { ...match, jobData: jobDetails.data };
                    } catch (e) {
                      return { ...match, jobData: { title: "Unknown Job", description: "Details unavailable" } };
                    }
                  })
                );
                setMatches(enrichedMatches);
              }
            } catch (err) {
              console.error(err);
            } finally {
              setIsMatching(false);
            }
          }
        }
      } catch (error) {
        if (error.response?.status === 500 || error.response?.status === 404) {
          navigate("/onboarding");
        }
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 relative via-blue-50/20 to-indigo-50/30 overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse hidden md:block"></div>
      <div className="absolute top-1/2 -left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 hidden md:block"></div>


      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-wide">
            Trajectory<span className="text-blue-500">AI</span>
          </h1>
        </div>
        <nav className="flex-1 py-6 space-y-2 px-4">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("resume")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'resume' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
            <FileText size={20} /> My Resume
          </button>
          <button onClick={() => setActiveTab("jobs")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'jobs' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
            <Briefcase size={20} /> Saved Jobs
          </button>
          <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
            <User size={20} /> Profile
          </button>
          <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
            <Settings size={20} /> Settings
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 overflow-y-auto">

        {activeTab === "dashboard" && (
          <>
        {/* Header Row */}
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Welcome to your Dashboard</h2>
            <p className="text-slate-500 mt-1 font-medium">Manage your AI career profile and job matches.</p>
          </div>
          <Button variant="outline" className="bg-white/80 hover:bg-white shadow-sm border-white/60 hover-lift" onClick={() => navigate("/onboarding")}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        {/* Top Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Profile & Bio Card */}
          <Card className="col-span-1 md:col-span-2 glass border-white/60 shadow-lg rounded-2xl">
            <CardHeader className="pb-2 border-b border-white/40 mb-4 bg-white/30 rounded-t-2xl">
              <CardTitle className="text-lg font-heading font-semibold flex items-center gap-2 text-slate-800">
                <User className="h-5 w-5 text-blue-600" />
                Your Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/50 text-slate-700 p-5 rounded-xl font-medium text-sm shadow-sm border border-white/60 whitespace-pre-wrap">
                {profile?.bio ? profile.bio : "No bio provided yet. Click 'Edit Profile' to add one!"}
              </div>
            </CardContent>
          </Card>

          {/* AI Status & Matches Card */}
          <Card className="glass border-white/60 shadow-lg rounded-2xl relative overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/40 mb-4 bg-gradient-to-r from-blue-100/50 to-white/30">
              <CardTitle className="text-sm font-heading font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
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
                      <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-1 justify-between" onClick={() => setSelectedJob(match)}>
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
        <div className="mt-8 relative z-10">
          <Card className="glass border-white/60 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/40 mb-4 flex flex-row items-center justify-between bg-white/30">
              <div>
                <CardTitle className="text-xl font-heading font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Extracted Resume Data
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600 font-medium">
                  This is the raw text the AI engine uses to calculate your vector matches.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* Terminal-style window */}
              <div className="bg-slate-900/95 backdrop-blur-md text-emerald-400 p-6 rounded-xl text-sm border border-slate-700/50 whitespace-pre-wrap h-96 overflow-y-auto font-mono shadow-2xl">
                {profile?.resumeText ? profile.resumeText : "No resume data found in the database."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- FULL WIDTH GRAPH SECTION --- */}
        {profile?.userId && (
          <div className="w-full mb-8 pt-8">
            <StudentGraphView userId={profile.userId} />
          </div>
        )}
          </>
        )}

        {/* --- NEW TABS START HERE --- */}
        {activeTab === "resume" && (
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight mb-6">My Document Intelligence</h2>
            <Card className="glass border-white/60 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-white/40 mb-4 bg-white/30">
                <CardTitle className="text-xl font-heading font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="h-6 w-6 text-blue-600" /> Current Neural Resume
                </CardTitle>
                <CardDescription>Your uploaded resume interpreted by the vector search model.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.resumeUrl ? (
                  <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl border border-blue-100 shadow-sm">
                    <FileText className="h-16 w-16 text-blue-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Resume Uploaded Successfully</h3>
                    <Button onClick={() => window.open(profile.resumeUrl, '_blank')} className="bg-blue-600 hover:bg-blue-700 shadow-sm mt-2">
                      View Source PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-12 flex flex-col items-center">
                    <FileText className="h-12 w-12 mb-4 text-slate-300" />
                    No resume found in standard storage.
                  </div>
                )}
                <div className="mt-8">
                   <h4 className="font-semibold text-slate-800 tracking-wide mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-500"/> Raw NLP Extracted Content</h4>
                   <div className="bg-slate-900/95 text-emerald-400 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap h-[500px] overflow-y-auto shadow-inner border border-slate-700 leading-relaxed">
                     {profile?.resumeText || "No parsed data found in semantic engine."}
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pt-8">
             <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight mb-8">Saved Jobs</h2>
             {savedJobs.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center py-16">
                 <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-full h-32 w-32 flex items-center justify-center mb-6">
                    <Briefcase className="h-12 w-12 text-blue-500" />
                 </div>
                 <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight mb-2">No Saved Jobs Yet</h2>
                 <p className="text-slate-500 text-lg max-w-md text-center">When you discover incredible matches on your dashboard, bookmark them, and they'll appear here for easy applying!</p>
                 <Button onClick={() => setActiveTab("dashboard")} className="mt-8 bg-slate-900 hover:bg-slate-800 rounded-full px-8">Find Matches</Button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {savedJobs.map((job, idx) => (
                   <Card key={idx} className="glass border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                     <CardContent className="p-6">
                       <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                       <p className="text-slate-500 mb-4">{job.company} • {job.location}</p>
                       <p className="text-slate-600 line-clamp-2 text-sm mb-6">{job.description}</p>
                       <Button variant="outline" className="w-full" onClick={() => setSelectedJob({jobData: job})}>View Details</Button>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-8">
               <div>
                  <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Identity Profile</h2>
                  <p className="text-slate-500 mt-1 font-medium">Your global presence in the Trajectory network.</p>
               </div>
               <Button variant="outline" className="bg-white/80 hover:bg-white shadow-sm border-white/60" onClick={() => navigate("/onboarding")}><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Button>
             </div>
             <Card className="glass border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
               <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>
               <CardContent className="p-8 pt-0">
                 <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12 mb-8 pb-8 border-b border-white/40 relative z-10">
                   <div className="bg-gradient-to-br from-white to-blue-50 w-32 h-32 rounded-full border-4 border-white flex items-center justify-center text-blue-700 text-5xl font-bold font-heading shadow-xl">
                     {profile?.fullName?.charAt(0) || "U"}
                   </div>
                   <div className="text-center sm:text-left mb-2">
                     <h3 className="text-3xl font-extrabold text-slate-900">{profile?.fullName || "Student Name"}</h3>
                     <Badge className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 text-xs">Trajectory Candidate</Badge>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                     <h4 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-wider">Professional Overview</h4>
                     <div className="bg-white/60 p-6 rounded-2xl border border-white/80 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                       {profile?.bio || "No bio provided. Stand out by telling recruiters your story!"}
                     </div>
                   </div>
                   <div className="space-y-4">
                     <div className="bg-white/60 p-5 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">System User ID</span>
                        <span className="font-mono text-slate-800 font-bold bg-slate-100 px-2 py-1 rounded">{profile?.userId || "-"}</span>
                     </div>
                     <div className="bg-white/60 p-5 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Vector Setup</span>
                        {profile?.isAiReady ? (
                           <span className="flex items-center text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> AI Synced</span>
                        ) : (
                           <span className="flex items-center text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div> Generating</span>
                        )}
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
             <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight mb-8">Account Settings</h2>
             
             <div className="space-y-4">
                 <Card className="glass border-white/60 shadow-md rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
                   <CardContent className="p-6 flex items-center justify-between" onClick={() => { localStorage.removeItem('jwt_token'); navigate('/'); }}>
                     <div className="flex items-center gap-4">
                       <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <Settings className="w-6 h-6" />
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-900">Sign Out</h3>
                         <p className="text-sm text-slate-500">Securely disconnect from the Trajectory platform.</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
             </div>
          </div>
        )}
      </main>

      {/* --- SLIDE OUT JOB DETAILS --- */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto bg-white/95 backdrop-blur-xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-slate-900 mt-4">{selectedJob?.jobData?.title || "Job Details"}</SheetTitle>
            <SheetDescription className="text-md text-slate-600 font-medium">{selectedJob?.jobData?.company} • {selectedJob?.jobData?.location}</SheetDescription>
          </SheetHeader>
          {selectedJob?.similarity_score && (
             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 mb-6 text-sm">
                ⭐ {selectedJob.similarity_score}% AI Match
             </Badge>
          )}
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Job Description</h4>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
                {selectedJob?.jobData?.description}
              </p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col gap-3">
             <Button className="w-full bg-blue-600 hover:bg-blue-700 text-md shadow-md py-6">Apply Now (External)</Button>
             {!savedJobs.find(sj => sj.id === selectedJob?.jobData?.id) && selectedJob?.jobData && (
                <Button variant="outline" className="w-full py-6" onClick={() => handleSaveJob(selectedJob?.jobData)}>Save for Later</Button>
             )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}