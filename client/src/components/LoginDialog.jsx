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
import { Loader2, Send } from "lucide-react";
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
            <span className="text-yellow-300 font-semibold">
              New account registration is paused temporarily.
            </span>{" "}
            <br />
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                type="email"
                className="text-white bg-black flex-grow"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
              />
              <Button
                type="submit"
                disabled={isSendingLoginLink}
                className="px-3"
              >
                {isSendingLoginLink ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
