import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import AuthGateway from "./pages/AuthGateway";
import StudentOnboarding from "./pages/StudentOnboarding";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerPostJob from "./pages/EmployerPostJob";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerCandidateView from "./pages/EmployerCandidateView";
import RecruiterSettings from "@/pages/RecruiterSettings.jsx";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Routes>
                    <Route path="/" element={<AuthGateway />} />
                    <Route path="/onboarding" element={<StudentOnboarding />} />
                    <Route path="/dashboard/student" element={<StudentDashboard />} />
                    <Route path="/jobs/new" element={<EmployerPostJob />} />

                    {/* Your Recruiter Routes */}
                    <Route path="/dashboard/employer" element={<EmployerDashboard />} />
                    <Route path="/dashboard/employer/job/:id" element={<EmployerCandidateView />} />
                    <Route path="/dashboard/employer/settings" element={<RecruiterSettings />} />
                </Routes>
            </div>

            {/* Enables slick popup notifications */}
            <Toaster position="bottom-right" richColors />
        </Router>
    );
}

export default App;