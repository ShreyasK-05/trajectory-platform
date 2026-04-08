import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// This now perfectly matches your export const springApi from api.js
import { springApi } from "@/api";

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export default function AuthGateway() {
  const navigate = useNavigate();

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // --- SIGNUP STATE ---
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [role, setRole] = useState("JOB_SEEKER");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await springApi.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const token = res.data.token;
      localStorage.setItem("jwt_token", token);

      // Decode the token to find out who just logged in
      const decodedPayload = decodeJwt(token);

      // Route them based on their backend role!
      if (decodedPayload?.role === "EMPLOYER") {
        navigate("/dashboard/employer");
      } else {
        navigate("/dashboard/student");
      }

    } catch (err) {
      console.error("Login Error:", err);
      setLoginError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setSignupError("");

    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }

    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }

    setSignupLoading(true);
    try {
      // 1. Send the registration payload
      await springApi.post("/auth/register", {
        email: signupEmail,
        password: signupPassword,
        role: role,
      });

      // 2. Automatically log them in to get the JWT
      const loginRes = await springApi.post("/auth/login", {
        email: signupEmail,
        password: signupPassword,
      });

      localStorage.setItem("jwt_token", loginRes.data.token);

      // 3. Route based on role
      if (role === "EMPLOYER") {
        navigate("/dashboard/employer");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setSignupError(
        err.response?.data?.message || "Registration failed. Email might be in use or backend is unreachable."
      );
    } finally {
      setSignupLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ---- Left branding panel (60%) ---- */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-between bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 animate-gradient p-12 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-bold tracking-tight">
            Trajectory<span className="text-blue-400">AI</span>
          </h2>
        </div>

        <div className="space-y-8 relative z-10">
          <h1 className="font-heading text-5xl font-extrabold leading-tight tracking-tight text-white xl:text-6xl drop-shadow-sm">
            Your career
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">launchpad</span>
          </h1>
          <p className="max-w-lg text-lg text-slate-300">
            Connect with top employers, discover opportunities matched by AI,
            and land your next role — all in one platform.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-slate-400">Active Jobs</p>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <p className="text-3xl font-bold text-white">10k+</p>
              <p className="text-sm text-slate-400">Candidates</p>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <p className="text-3xl font-bold text-white">82%</p>
              <p className="text-sm text-slate-400">AI Match Rate</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TrajectoryAI. All rights reserved.
        </p>
      </div>

      {/* ---- Right form panel (40%) ---- */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 relative px-6 py-10 lg:w-[40%]">

        {/* Mobile branding */}
        <div className="mb-8 text-center lg:hidden relative z-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
            Trajectory<span className="text-blue-600">AI</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Your career launchpad
          </p>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Get started
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to your account or create a new one.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* ---- Login Tab ---- */}
            <TabsContent value="login" className="mt-4">
              <Card className="glass border-white/60 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-white/40 pb-6 border-b border-white/50">
                  <CardTitle className="font-heading text-xl">Welcome back</CardTitle>
                  <CardDescription className="text-slate-600">
                    Enter your credentials to access your account.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    {loginError && (
                      <p className="text-sm font-medium text-red-500 bg-red-50 p-2 rounded-md border border-red-200">{loginError}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover-lift font-medium"
                      size="lg"
                      disabled={loginLoading}
                    >
                      {loginLoading ? "Signing in…" : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---- Sign Up Tab ---- */}
            <TabsContent value="signup" className="mt-4">
              <Card className="glass border-white/60 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-white/40 pb-6 border-b border-white/50">
                  <CardTitle className="font-heading text-xl">Create an account</CardTitle>
                  <CardDescription className="text-slate-600">
                    Get started for free — no credit card required.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    {/* Backend Role Toggle */}
                    <div className="space-y-2 pt-2">
                      <Label>I am a...</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant={role === "JOB_SEEKER" ? "default" : "outline"}
                          onClick={() => setRole("JOB_SEEKER")}
                          className={role === "JOB_SEEKER" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white"}
                        >
                          Job Seeker
                        </Button>
                        <Button
                          type="button"
                          variant={role === "EMPLOYER" ? "default" : "outline"}
                          onClick={() => setRole("EMPLOYER")}
                          className={role === "EMPLOYER" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white"}
                        >
                          Employer
                        </Button>
                      </div>
                    </div>

                    {signupError && (
                      <p className="text-sm font-medium text-red-500 bg-red-50 p-2 rounded-md border border-red-200">{signupError}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-md hover-lift font-medium"
                      size="lg"
                      disabled={signupLoading}
                    >
                      {signupLoading ? "Creating account…" : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}