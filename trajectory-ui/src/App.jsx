import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthGateway from "./pages/AuthGateway";
import StudentOnboarding from "./pages/StudentOnboarding";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerPostJob from "./pages/EmployerPostJob";
import EmployerDashboard from "./pages/EmployerDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<AuthGateway />} />
          <Route path="/onboarding" element={<StudentOnboarding />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/jobs/new" element={<EmployerPostJob />} />
          <Route path="/dashboard/employer" element={<EmployerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;