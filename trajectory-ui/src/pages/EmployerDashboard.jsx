import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { springApi } from "../api";
import { toast } from "sonner";
import { LayoutDashboard, Briefcase, Users, Settings, Plus, Loader2, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function EmployerDashboard() {
    const navigate = useNavigate();

    // --- NEW: Data Fetching State ---
    const [myJobs, setMyJobs] = useState([]);
    const [isFetchingJobs, setIsFetchingJobs] = useState(true);
    const [myProfile, setMyProfile] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ title: "", company: "", location: "", description: "" });
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Jobs
                const jobsResponse = await springApi.get("/jobs/me");
                setMyJobs(jobsResponse.data); // Fixed the setMyMyJobs typo here!

                // Fetch Profile to get the Name!
                const profileResponse = await springApi.get("/profile/me");
                setMyProfile(profileResponse.data);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsFetchingJobs(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await springApi.post("/jobs/create", formData);
            const newJobId = response.data.id;
            toast.success("Job successfully posted! Launching AI Matcher...");
            setIsSheetOpen(false);
            setFormData({ title: "", company: "", location: "", description: "" }); // Clear form
            navigate(`/dashboard/employer/job/${newJobId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post the job.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* 1. LEFT SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white tracking-wide">Trajectory<span className="text-blue-500">AI</span></h1>
                </div>
                <nav className="flex-1 py-6 space-y-2 px-4">
                    <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab("postings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'postings' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
                        <Briefcase size={20} /> My Postings
                    </button>
                    <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800'}`}>
                        <Settings size={20} /> Settings
                    </button>
                </nav>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === "dashboard" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            {/* --- DYNAMIC WELCOME TEXT --- */}
                            <h2 className="text-3xl font-bold text-slate-900">
                                Welcome, {myProfile?.fullName || myProfile?.full_name || "Recruiter"}!
                            </h2>
                            <p className="text-slate-500 mt-1">Here is what is happening with your candidate pipeline today.</p>
                        </div>
                        <Button onClick={() => setIsSheetOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Plus className="mr-2 h-4 w-4" /> Post New Job
                        </Button>
                    </div>

                {/* --- DYNAMIC Metrics Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active Postings</CardTitle>
                            <Briefcase className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">
                                {isFetchingJobs ? "..." : myJobs.length}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mocked scaling data for visual effect */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Candidates Sourced</CardTitle>
                            <Users className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">
                                {isFetchingJobs ? "..." : myJobs.length * 14}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Avg. AI Match Rate</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent><div className="text-3xl font-bold text-slate-900">82%</div></CardContent>
                    </Card>
                </div>

                {/* --- DYNAMIC Recent Jobs Table --- */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Recent Job Postings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isFetchingJobs ? (
                            <div className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>
                        ) : myJobs.length === 0 ? (
                            <div className="text-sm text-slate-500 py-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
                                No active jobs found. Click "Post New Job" to get started!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myJobs.map((job) => (
                                    <div key={job.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{job.title}</h4>
                                            <p className="text-sm text-slate-500">{job.company} • {job.location}</p>
                                        </div>
                                        <Link to={`/dashboard/employer/job/${job.id}`}>
                                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                View Matches <ExternalLink className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>
                )}

                {activeTab === "postings" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Active Job Postings</h2>
                                <p className="text-slate-500 mt-1 font-medium">Manage and track your sourced candidates.</p>
                            </div>
                            <Button onClick={() => setIsSheetOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                                <Plus className="mr-2 h-4 w-4" /> Post New Job
                            </Button>
                        </div>
                        {isFetchingJobs ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
                        ) : myJobs.length === 0 ? (
                            <Card className="glass border-white/60 shadow-lg rounded-2xl p-16 text-center">
                                <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-800">No Jobs Posted</h3>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto mb-8">You haven't posted any jobs yet. Create your first role to start matching with top candidates instantly.</p>
                                <Button onClick={() => setIsSheetOpen(true)} className="bg-slate-900 hover:bg-slate-800 rounded-full px-8 py-6 text-lg"><Plus className="mr-2 h-5 w-5" /> Create a Job Posting</Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {myJobs.map((job) => (
                                    <Card key={job.id} className="glass border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate(`/dashboard/employer/job/${job.id}`)}>
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center">
                                                <div className="p-6 md:p-8 flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Active</span>
                                                    </div>
                                                    <p className="text-slate-500 text-lg mb-4">{job.company} • {job.location}</p>
                                                    <p className="text-slate-600 line-clamp-2">{job.description}</p>
                                                </div>
                                                <div className="bg-slate-50/50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-200/60 flex flex-col justify-center items-center h-full">
                                                    <div className="text-4xl font-bold font-heading text-blue-600 mb-2">Match</div>
                                                    <Button variant="outline" className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700">View Candidates <ExternalLink className="ml-2 h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto mt-10">
                        <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight mb-8">Employer Settings</h2>
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
                )}
            </main>

            {/* 3. THE SLIDE-OUT JOB CREATION FORM */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-[600px] overflow-y-auto bg-white">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold">Create a New Role</SheetTitle>
                        <SheetDescription>Provide the job details below. Our AI will automatically extract requirements and match them against student resumes.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Job Title</Label><Input name="title" required value={formData.title} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Company</Label><Input name="company" required value={formData.company} onChange={handleChange} /></div>
                        </div>
                        <div className="space-y-2"><Label>Location</Label><Input name="location" required value={formData.location} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label>Job Description</Label><Textarea name="description" className="h-[250px] resize-none" required value={formData.description} onChange={handleChange} /></div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish & Run AI Match"}
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}