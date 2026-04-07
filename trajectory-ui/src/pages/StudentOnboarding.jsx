import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles, UserCircle } from "lucide-react";
import { toast } from "sonner"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { springApi } from "@/api"; 

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  
  // Steps: 1 (Bio), 2 (Upload), 3 (Parsing), 4 (Review)
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");
  
  // New state for the Bio
  const [bio, setBio] = useState("");
  const [isSubmittingBio, setIsSubmittingBio] = useState(false);

  // --- STEP 1 HANDLER: Save Bio ---
  const handleBioSubmit = async () => {
    // If they left it blank, just treat it as a skip and move to Step 2
    if (!bio.trim()) {
      setStep(2);
      return;
    }

    setIsSubmittingBio(true);
    try {
      // Hits your existing onboardUser method in Spring Boot!
      await springApi.post("/profile/onboard", { bio });
      setStep(2);
    } catch (error) {
      console.error("Bio upload failed:", error);
      // If the profile already exists (e.g. they refreshed the page), just move forward
      if (error.response?.data?.includes("already exists")) {
          setStep(2);
      } else {
          toast.error("Failed to save bio. Is the backend running?");
      }
    } finally {
      setIsSubmittingBio(false);
    }
  };

  // --- STEP 2 HANDLER: Upload PDF ---
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }

    setUploadedFileName(file.name);
    setStep(3); // Move to the loading screen
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      setProgress(Math.min(currentProgress, 90)); 
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file); 

      // This will find the profile we just created in Step 1 and update it!
      await springApi.post("/profile/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setStep(4), 500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload failed:", error);
      toast.error(error.response?.data || "Failed to upload resume.");
      setStep(2); // Kick them back to the upload screen
    }
  };

  const handleFinish = () => {
    navigate("/dashboard/student");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Trajectory<span className="text-blue-600">AI</span>
        </h1>
        <p className="text-slate-500 mt-2">Let's build your AI-powered career profile.</p>
      </div>

      <Card className="w-full max-w-lg shadow-lg border-slate-200">
        
        {/* STEP 1: BIO SETUP */}
        {step === 1 && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
              <CardDescription>
                Write a short bio. You can update this later when we add profile pictures and more details!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="I am a computer science student passionate about AI and full-stack development..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>Skip for now</Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={handleBioSubmit}
                disabled={isSubmittingBio}
              >
                {isSubmittingBio ? "Saving..." : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* STEP 2: UPLOAD RESUME */}
        {step === 2 && (
          <>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
              <CardDescription>
                We'll extract your skills, education, and experience automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" 
                onClick={() => fileInputRef.current.click()}
              >
                <UploadCloud className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="font-medium text-slate-900 mb-1">Click to upload PDF</h3>
                <p className="text-sm text-slate-500">Max file size: 5MB</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
              <Button variant="ghost" onClick={handleFinish}>Skip for now</Button>
            </CardFooter>
          </>
        )}

        {/* STEP 3: PARSING / UPLOADING */}
        {step === 3 && (
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white rounded-full p-4 shadow-sm border border-slate-100">
                <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Uploading & Analyzing...</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Sending your PDF to MinIO and spinning up the AI extraction workers.
            </p>
            <div className="w-full max-w-xs space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-slate-400 text-right">{progress}%</p>
            </div>
          </CardContent>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Upload Successful!</CardTitle>
              <CardDescription>
                Your resume has been saved. Our AI is crunching the data in the background.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-slate-400 h-5 w-5" />
                  <span className="font-medium text-slate-700">{uploadedFileName}</span>
                </div>
              </div>
              <p className="text-sm text-center text-slate-500">
                You will see your extracted skills appear on your dashboard shortly.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleFinish}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

      </Card>
    </div>
  );
}