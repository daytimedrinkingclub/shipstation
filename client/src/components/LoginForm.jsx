import { useState, useEffect, useContext } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { AuthContext } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";

const LoginForm = ({ onSubmit, isLoading }) => {
  const [searchParams] = useSearchParams();
  const isLogout = searchParams.get("logout") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(!isLogout);
  const [passwordError, setPasswordError] = useState("");

  const { handleGoogleLogin } = useContext(AuthContext);

  useEffect(() => {
    // Load Google One-Tap script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleOneTap"),
        { theme: "outline", size: "large" }
      );

      window.google.accounts.id.prompt();
    }
  }, [handleGoogleLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSigningUp) {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
      setPasswordError("");
    }
    onSubmit(email, password);
  };

  return (
    <Card className="w-full max-w-lg border-none sm:border">
      <CardHeader>
        <CardTitle className="text-foreground">
          {isSigningUp ? "Sign up for free" : "Login to your account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSigningUp ? (
            "Enter your email and create a password to get started."
          ) : (
            <>
              Enter your email address and password to continue.
              <br />
              {/* An account will be created for you if none exists. */}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background text-foreground"
            />
          </div>
          {isSigningUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background text-foreground"
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
          )}
          <div className="flex justify-between items-center gap-4">
            <Button
              variant="link"
              type="button"
              size="sm"
              className="p-0"
              onClick={() => {
                setIsSigningUp(!isSigningUp);
                setPasswordError("");
              }}
            >
              {isSigningUp
                ? "Already have an account?"
                : "Create a new account"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isSigningUp ? "Create account" : "Log in"}
                </>
              )}
            </Button>
          </div>
        </form>
        {/* <div className="my-4">
          <Separator />
        </div>
        <div className="mt-4 flex justify-center">
          <div id="googleOneTap"></div>
        </div> */}
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        <p>
          By continuing, you agree to ShipStation.ai's{" "}
          <a
            href="https://shipstation.ai/terms.html"
            className="hover:text-primary"
            target="_blank"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://shipstation.ai/privacy-policy.html"
            className="hover:text-primary"
            target="_blank"
          >
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
