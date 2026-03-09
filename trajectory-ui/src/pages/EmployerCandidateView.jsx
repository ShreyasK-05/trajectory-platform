import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { pythonApi } from "../api";
import { ArrowLeft, UserCircle, Briefcase, MapPin, Building2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerCandidateView() {
    const { id } = useParams(); // Grabs the '16' from the URL
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Hit the Python FastAPI worker directly!
                const response = await pythonApi.get(`/match/job/${id}`);

                // 1. Let's print exactly what Python sent us to the browser console!
                console.log("Python AI Response:", response.data);

                // 2. The Fix: Safely extract the array no matter how Python formatted it
                if (Array.isArray(response.data)) {
                    setCandidates(response.data);
                } else if (response.data && response.data.top_matches) {
                    // THIS IS THE FIX! We are catching the 'top_matches' array Python sent!
                    setCandidates(response.data.top_matches);
                } else if (response.data && response.data.matches) {
                    setCandidates(response.data.matches);
                } else if (response.data && response.data.data) {
                    setCandidates(response.data.data);
                } else if (response.data && response.data.candidates) {
                    setCandidates(response.data.candidates);
                } else {
                    console.error("Python didn't send an array!", response.data);
                    setCandidates([]);
                }

            } catch (error) {
                console.error("Failed to fetch matches:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, [id]);

    // Helper function to color code the badges based on AI score
    const getScoreBadge = (score) => {
        // Assuming score is returned as a decimal (e.g. 0.85) or percentage (85)
        const normalizedScore = score <= 1 ? score * 100 : score;

        if (normalizedScore >= 80) return <Badge className="bg-green-500 hover:bg-green-600">Top Match</Badge>;
        if (normalizedScore >= 60) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Good Fit</Badge>;
        return <Badge className="bg-slate-400 hover:bg-slate-500">Weak Match</Badge>;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            {/* Top Navigation */}
            <div className="mb-8">
                <Link to="/dashboard/employer">
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-900 -ml-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 mt-4 flex items-center gap-2">
                    <Sparkles className="text-blue-600 h-6 w-6" /> AI Sourcing Results
                </h1>
                <p className="text-slate-500 mt-1">Showing the best student matches for Job ID: {id}</p>
            </div>

            {/* SPLIT PANE LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT PANE: Job Context */}
                <div className="col-span-1">
                    <Card className="sticky top-8 shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                            <CardTitle className="text-xl">Target Role</CardTitle>
                            <CardDescription className="text-slate-400">Context used for vector matching</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3 text-slate-700">
                                <Briefcase className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">Job Reference #{id}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <Building2 className="h-5 w-5 text-blue-500" />
                                <span>Company Overview</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                <span>Location Tracking</span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-500 italic">
                                    "Our neural network has mapped this job's requirements against thousands of student vectors to find the highest cosine similarity..."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT PANE: The AI Matches */}
                <div className="col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Ranked Candidates</h2>

                    {/* Skeleton Loaders while Python does the math */}
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="p-6 flex items-center gap-6">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-3 flex-1">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </Card>
                        ))
                    ) : candidates.length === 0 ? (
                        <Card className="p-12 text-center text-slate-500 border-dashed border-2">
                            No matching candidates found in the vector database yet.
                        </Card>
                    ) : (
                        /* The Actual Matched Candidate Cards */
                        candidates.map((match, index) => {
                            // Standardize score to 0-100 for the progress bar
                            const scorePercent = match.match_score <= 1 ? (match.match_score * 100).toFixed(1) : parseFloat(match.match_score).toFixed(1);

                            return (
                                <Card key={index} className="overflow-hidden shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-blue-200">
                                    <div className="p-6 flex items-start gap-6">
                                        {/* Candidate Avatar */}
                                        <div className="bg-slate-100 p-4 rounded-full">
                                            <UserCircle className="h-10 w-10 text-slate-400" />
                                        </div>

                                        {/* Candidate Details & Progress Bar */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">Student Candidate ID: {match.user_id}</h3>
                                                    <p className="text-sm text-slate-500">Vectorized Resume Profile</p>
                                                </div>
                                                {getScoreBadge(match.match_score)}
                                            </div>

                                            {/* The Match Visualizer */}
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700">Cosine Similarity Score</span>
                                                    <span className="font-bold text-blue-600">{scorePercent}%</span>
                                                </div>
                                                <Progress value={scorePercent} className="h-2" />
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-6 flex gap-3">
                                                <Button variant="outline" className="w-full">View Full Profile</Button>
                                                <Button className="w-full bg-slate-900 hover:bg-slate-800">Contact Student</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}