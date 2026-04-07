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
                    {/* Changed simple <a> tags to React Router <Link> tags for faster navigation */}
                    <Link to="/dashboard/employer" className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-md transition-colors">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/dashboard/employer" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                        <Briefcase size={20} /> My Postings
                    </Link>

                    {/* --- NEW: Settings Link added here --- */}
                    <Link to="/dashboard/employer/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                        <Settings size={20} /> Settings
                    </Link>
                </nav>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 p-8">
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