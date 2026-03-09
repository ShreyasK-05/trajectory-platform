import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../api";
import { toast } from "sonner";
import { LayoutDashboard, Briefcase, Users, Settings, Plus, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

export default function EmployerDashboard() {
    const navigate = useNavigate();

    // State for the Slide-out Sheet
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        description: "",
    });

    // Handle Form Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Submit to Spring Boot Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Hitting the Spring Boot endpoint you built
            const response = await springApi.post("/jobs/create", formData);

            // Assuming your backend returns the saved job object with an ID
            const newJobId = response.data.id || response.data.jobId;

            toast.success("Job successfully posted! Launching AI Matcher...");

            // Close the sheet and navigate to the Candidate Sourcing Screen
            setIsSheetOpen(false);
            navigate(`/dashboard/employer/job/${newJobId}`);

        } catch (error) {
            console.error("Error creating job:", error);
            toast.error(error.response?.data?.message || "Failed to post the job. Please try again.");
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
                    <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-md transition-colors">
                        <LayoutDashboard size={20} /> Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                        <Briefcase size={20} /> My Postings
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                        <Users size={20} /> Candidates
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                        <Settings size={20} /> Settings
                    </a>
                </nav>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 p-8">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Welcome, Recruiter!</h2>
                        <p className="text-slate-500 mt-1">Here is what is happening with your candidate pipeline today.</p>
                    </div>

                    {/* THE MAGIC BUTTON - Opens the Sheet */}
                    <Button onClick={() => setIsSheetOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> Post New Job
                    </Button>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active Postings</CardTitle>
                            <Briefcase className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent><div className="text-3xl font-bold text-slate-900">4</div></CardContent>
                    </Card>
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Candidates Sourced</CardTitle>
                            <Users className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent><div className="text-3xl font-bold text-slate-900">128</div></CardContent>
                    </Card>
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Avg. AI Match Rate</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent><div className="text-3xl font-bold text-slate-900">84%</div></CardContent>
                    </Card>
                </div>

                {/* Recent Jobs Table (Mock Data for Visual Polish) */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Recent Job Postings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-500 py-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
                            No active jobs found. Click "Post New Job" to get started!
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* 3. THE SLIDE-OUT JOB CREATION FORM */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-[600px] overflow-y-auto bg-white">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold">Create a New Role</SheetTitle>
                        <SheetDescription>
                            Provide the job details below. Our AI will automatically extract requirements and match them against student resumes.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input id="title" name="title" placeholder="e.g. Backend Engineer" required value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" name="company" placeholder="e.g. TechCorp" required value={formData.company} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" name="location" placeholder="e.g. San Francisco, CA (or Remote)" required value={formData.location} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Paste the full job description here..."
                                className="h-[250px] resize-none"
                                required
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing & AI Vectorizing...</>
                            ) : (
                                "Publish & Run AI Match"
                            )}
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}