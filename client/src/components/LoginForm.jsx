import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const LoginForm = ({ onSubmit, isLoading }) => {
  const [searchParams] = useSearchParams();
  const isLogout = searchParams.get("logout") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(!isLogout);
  const [passwordError, setPasswordError] = useState("");

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
          {isSigningUp ? "Create an account" : "Sign in to your account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSigningUp ? (
            "Enter your email and create a password to get started."
          ) : (
            <>
              Enter your email address and password to continue.
              <br />
              An account will be created for you if none exists.
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
                  {isSigningUp ? "Create account" : "Sign in"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
