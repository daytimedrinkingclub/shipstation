import { useState, useCallback, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BadgeHelpIcon,
  Crown,
  LogOut,
  MessageSquare,
  Star,
  UserIcon,
  Check,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import ChatWidget from "@/components/ChatWidget";

const UserAccountMenu = ({ user, onLogout, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const { isSubscribed } = useContext(AuthContext);

  const handleOpenSubscriptionDialog = () => {
    setIsSubscriptionDialogOpen(true);
    setIsOpen(false);
  };

  const handleOpenChatWidget = useCallback(() => {
    setIsOpen(false);
    setIsChatWidgetOpen(true);
  }, []);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <UserIcon className="h-4 w-4 sm:mr-2" />
            {!isMobile && (
              <span className="hidden md:inline">{user.email}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {isMobile && (
            <>
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem 
            onSelect={handleOpenSubscriptionDialog}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <Crown className="mr-2 h-4 w-4" />
              <span className="text-foreground">
                {isSubscribed ? "Pro Member" : "Upgrade to Pro"}
              </span>
            </div>
            {isSubscribed && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://github.com/daytimedrinkingclub/shipstation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Star className="mr-2 h-4 w-4" />
              <span className="text-foreground">Star us on GitHub</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://discord.gg/wMNmcmq3SX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className="text-foreground">Join our Discord</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleOpenChatWidget}>
            <BadgeHelpIcon className="mr-2 h-4 w-4" />
            <span className="text-foreground">Need help?</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span className="text-foreground">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SubscriptionDialog
        isOpen={isSubscriptionDialogOpen}
        onClose={() => setIsSubscriptionDialogOpen(false)}
        isSubscribed={isSubscribed}
        user={user}
      />
      {isChatWidgetOpen && (
        <ChatWidget user={user} onClose={() => setIsChatWidgetOpen(false)} />
      )}
    </>
  );
};

export default UserAccountMenu;
