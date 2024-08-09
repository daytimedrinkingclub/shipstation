import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

const LoginDialog = ({ isOpen, onClose, createAccount = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, isLoading, sendLoginLink, isSendingLoginLink } =
    useContext(AuthContext);

  const [isSigningUp, setIsSigningUp] = useState(createAccount);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin(email, password);
    if (result.success) {
      toast("Welcome back 👋", {
        description: "Lets start creating something beautiful!",
        position: "bottom-right",
      });
      onClose();
    } else {
      toast.error("Unable to proceed", {
        description: result.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-white bg-black">
        <DialogHeader>
          <DialogTitle>
            {isSigningUp ? "Sign up for free" : "Identify yourself"}
          </DialogTitle>
          <DialogDescription>
            {isSigningUp ? (
              "Enter your email and password to create account."
            ) : (
              <>
                Enter your email address and password to continue.
                <br />
                An account will be created for you if none exists.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="text-white bg-black"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <span
                className="text-sm text-gray-400 hover:text-white cursor-pointer"
                onClick={() => {
                  sendLoginLink(email).then(() => {
                    toast.success("Login link sent successfully, check your email.");
                  });
                }}
              >
                {isSendingLoginLink ? "Sending..." : "Email me a login link!"}
              </span>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Please enter your password"
              className="text-white bg-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!email}
            />
          </div>
          <div className="flex justify-between items-center">
            <Button
              variant="link"
              type="button"
              className="underline"
              size="sm"
              onClick={() => setIsSigningUp(!isSigningUp)}
            >
              {isSigningUp
                ? "Already have an account?"
                : "Create a new account?"}
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
                  {isSigningUp ? "Submit" : "Sign in"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
