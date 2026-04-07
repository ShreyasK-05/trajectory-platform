import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { springApi } from "../api";
import { toast } from "sonner";
import { ArrowLeft, Building2, UserCircle, Save, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RecruiterSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [formData, setFormData] = useState({ fullName: "", companyName: "", bio: "" });

    // Fetch existing data when the page loads
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await springApi.get("/profile/me");
                if (response.data) {
                    setFormData({
                        fullName: response.data.fullName || response.data.full_name || "",
                        companyName: response.data.companyName || response.data.company_name || "",
                        bio: response.data.bio || ""
                    });
                }
            } catch (error) {
                console.error("No existing profile found or error fetching.", error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await springApi.post("/profile/employer/onboard", formData);
            toast.success("Profile successfully updated!");
        } catch (error) {
            toast.error("Failed to update profile.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/dashboard/employer">
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-900 -ml-4 mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-blue-600 h-8 w-8" /> Organization Settings
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your recruiter profile and company details.</p>
                </div>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>This information will be visible to matched candidates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isFetching ? (
                            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 h-8 w-8" /></div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><UserCircle className="h-4 w-4"/> Full Name</Label>
                                    <Input name="fullName" placeholder="e.g. Jane Doe" value={formData.fullName} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Building2 className="h-4 w-4"/> Company Name</Label>
                                    <Input name="companyName" placeholder="e.g. TechCorp Inc." value={formData.companyName} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Company Bio / Description</Label>
                                    <Textarea name="bio" placeholder="Tell candidates a bit about your company..." className="h-32 resize-none" value={formData.bio} onChange={handleChange} />
                                </div>

                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" disabled={isLoading}>
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}