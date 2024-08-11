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

const LoginDialog = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const { sendLoginLink, isSendingLoginLink } = useContext(AuthContext);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendLoginLink(email).then(() => {
      toast.success("Login link sent successfully, check your email.");
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-white bg-black">
        <DialogHeader>
          <DialogTitle>Login to ShipStation</DialogTitle>
          <DialogDescription>
            Enter your email address and we will send you a login link.
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
          <div className="flex justify-end">
            <Button type="submit" disabled={isSendingLoginLink}>
              {isSendingLoginLink ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Send me login link
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
