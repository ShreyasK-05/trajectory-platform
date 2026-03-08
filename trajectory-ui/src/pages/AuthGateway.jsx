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
import api from "@/api";

export default function AuthGateway() {
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("jwt_token", res.data.token);
      navigate("/dashboard/student");
    } catch (err) {
      setLoginError(
        err.response?.data?.message || "Invalid email or password."
      );
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
      const res = await api.post("/api/auth/register", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      localStorage.setItem("jwt_token", res.data.token);
      navigate("/onboarding");
    } catch (err) {
      setSignupError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSignupLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ---- Left branding panel (60%) ---- */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-between bg-sidebar p-10">
        <div>
          <h2 className="text-2xl font-bold text-sidebar-foreground">
            Trajectory<span className="text-primary">AI</span>
          </h2>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-sidebar-foreground xl:text-5xl">
            Your career{" "}
            <span className="text-primary">launchpad</span>
          </h1>
          <p className="max-w-lg text-lg text-sidebar-foreground/70">
            Connect with top employers, discover opportunities matched by AI,
            and land your next role — all in one platform.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-sidebar-foreground">500+</p>
              <p className="text-sm text-sidebar-foreground/60">Active Jobs</p>
            </div>
            <div className="h-10 w-px bg-sidebar-foreground/20" />
            <div>
              <p className="text-3xl font-bold text-sidebar-foreground">10k+</p>
              <p className="text-sm text-sidebar-foreground/60">Candidates</p>
            </div>
            <div className="h-10 w-px bg-sidebar-foreground/20" />
            <div>
              <p className="text-3xl font-bold text-sidebar-foreground">82%</p>
              <p className="text-sm text-sidebar-foreground/60">AI Match Rate</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-sidebar-foreground/40">
          &copy; {new Date().getFullYear()} TrajectoryAI. All rights reserved.
        </p>
      </div>

      {/* ---- Right form panel (40%) ---- */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-10 lg:w-[40%]">
        {/* Mobile branding — shown only on small screens */}
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trajectory<span className="text-primary">AI</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your career launchpad
          </p>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Get started
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account or create a new one.
            </p>
          </div>

          {/* Auth Card */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Log In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ---- Login Tab ---- */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account.
                  </CardDescription>
                </CardHeader>

                <CardContent>
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
                      />
                    </div>

                    {loginError && (
                      <p className="text-sm text-destructive">{loginError}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loginLoading}
                    >
                      {loginLoading ? "Signing in…" : "Sign In"}
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="flex-col gap-4">
                  <div className="flex w-full items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account? Switch to the{" "}
                    <span className="font-medium text-primary">Sign Up</span>{" "}
                    tab.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ---- Sign Up Tab ---- */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Get started for free — no credit card required.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Jane Doe"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
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
                      />
                    </div>

                    {signupError && (
                      <p className="text-sm text-destructive">{signupError}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={signupLoading}
                    >
                      {signupLoading ? "Creating account…" : "Create Account"}
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="flex-col gap-4">
                  <div className="flex w-full items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account? Switch to the{" "}
                    <span className="font-medium text-primary">Log In</span>{" "}
                    tab.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}