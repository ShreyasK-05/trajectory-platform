import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { pythonApi, springApi } from "../api"; // Make sure springApi is imported!
import { ArrowLeft, UserCircle, Briefcase, MapPin, Building2, Sparkles, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function EmployerCandidateView() {
    const { id } = useParams();
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- NEW: Modal State Variables ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await pythonApi.get(`/match/job/${id}`);

                if (Array.isArray(response.data)) {
                    setCandidates(response.data);
                } else if (response.data && response.data.top_matches) {
                    setCandidates(response.data.top_matches);
                } else {
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

    // --- NEW: Function to fetch the actual profile from Spring Boot ---
    const handleViewProfile = async (userId) => {
        setIsModalOpen(true);
        setIsProfileLoading(true);
        setSelectedProfile(null); // Clear previous data

        try {
            // Hit the Spring Boot endpoint we just created!
            const response = await springApi.get(`/profile/candidate/${userId}`);
            setSelectedProfile(response.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("This candidate hasn't completed their detailed profile yet.");
            setIsModalOpen(false); // Close modal if it fails
        } finally {
            setIsProfileLoading(false);
        }
    };

    const getScoreBadge = (score) => {
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT PANE: Job Context */}
                <div className="col-span-1">
                    {/* ... (Left pane code remains exactly the same as before) ... */}
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

                    {isLoading ? (
                        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" /></div>
                    ) : candidates.length === 0 ? (
                        <Card className="p-12 text-center text-slate-500 border-dashed border-2">
                            No matching candidates found in the vector database yet.
                        </Card>
                    ) : (
                        candidates.map((match, index) => {
                            const scorePercent = match.match_score <= 1 ? (match.match_score * 100).toFixed(1) : parseFloat(match.match_score).toFixed(1);

                            return (
                                <Card key={index} className="overflow-hidden shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-blue-200">
                                    <div className="p-6 flex items-start gap-6">
                                        <div className="bg-slate-100 p-4 rounded-full">
                                            <UserCircle className="h-10 w-10 text-slate-400" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">Student Candidate ID: {match.user_id}</h3>
                                                    <p className="text-sm text-slate-500">Vectorized Resume Profile</p>
                                                </div>
                                                {getScoreBadge(match.match_score)}
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700">Cosine Similarity Score</span>
                                                    <span className="font-bold text-blue-600">{scorePercent}%</span>
                                                </div>
                                                <Progress value={scorePercent} className="h-2" />
                                            </div>

                                            {/* --- NEW: Wired up the onClick event! --- */}
                                            <div className="mt-6 flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => handleViewProfile(match.user_id)}
                                                >
                                                    View Full Profile
                                                </Button>
                                                <Button className="w-full bg-slate-900 hover:bg-slate-800">Shortlist</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* --- NEW: The Candidate Deep-Dive Modal Overlay --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserCircle className="h-6 w-6 text-blue-500" />
                            Candidate Profile
                        </DialogTitle>
                        <DialogDescription>
                            Detailed human-readable data parsed by our AI systems.
                        </DialogDescription>
                    </DialogHeader>

                    {isProfileLoading ? (
                        <div className="py-12 flex justify-center flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-sm text-slate-500">Decrypting profile data from secure vault...</p>
                        </div>
                    ) : selectedProfile ? (
                        <div className="space-y-6">

                            {/* Bio Section */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Professional Bio</h4>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedProfile.bio || "No bio provided by the candidate."}
                                </p>
                            </div>

                            {/* Resume Text Section */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Extracted Resume Text
                                </h4>
                                <div className="bg-white p-4 rounded border border-slate-200 max-h-[300px] overflow-y-auto text-sm text-slate-600 whitespace-pre-wrap font-mono">
                                    {selectedProfile.resumeText || selectedProfile.resume_text || "No resume text extracted."}
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                                {selectedProfile.resumeUrl || selectedProfile.resume_url ? (
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(selectedProfile.resumeUrl || selectedProfile.resume_url, '_blank')}>
                                        Download Original PDF
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-slate-500">
                            Profile data could not be loaded.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}