import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner"; // For error popups

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { springApi } from "@/api"; // Your configured Axios instance

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Reference to our hidden file input
  
  // Steps: 1 (Upload), 2 (Uploading/Parsing), 3 (Review)
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // This triggers when the user selects a file from their computer
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Frontend validation (matches your backend validation!)
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }

    setUploadedFileName(file.name);
    setStep(2); // Move to the loading screen
    
    // UX: Start a fake progress bar just to look nice while the network works
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      setProgress(Math.min(currentProgress, 90)); // Cap at 90% until the API finishes
    }, 300);

    try {
      // 2. Pack the file into a form-data object
      const formData = new FormData();
      formData.append("file", file); // Must match the @RequestParam("file") in Spring Boot

      // 3. Send it to your ProfileController
      await springApi.post("/profile/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 4. Success! Fill the bar to 100% and move to the final step
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setStep(3), 500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload failed:", error);
      toast.error(error.response?.data || "Failed to upload resume. Is the backend running?");
      setStep(1); // Kick them back to the upload screen
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
        
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
              <CardDescription>
                We'll extract your skills, education, and experience automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* HIDDEN FILE INPUT */}
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />

              {/* THE DROPZONE (Clicks the hidden input) */}
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

        {/* STEP 2: PARSING / UPLOADING */}
        {step === 2 && (
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

        {/* STEP 3: REVIEW */}
        {step === 3 && (
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