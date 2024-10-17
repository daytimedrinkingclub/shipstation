import { useState, useCallback } from "react";
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
} from "lucide-react";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import ChatWidget from "@/components/ChatWidget";

const UserAccountMenu = ({ user, onLogout, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] =
    useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);

  const handleOpenSubscriptionDialog = () => {
    setIsSubscriptionDialogOpen(true);
    setIsOpen(false);
  };

  const handleOpenChatWidget = useCallback(() => {
    setIsOpen(false);
    setIsChatWidgetOpen(true);
  }, [isOpen, isChatWidgetOpen]);

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
          <DropdownMenuItem onSelect={handleOpenSubscriptionDialog}>
            <Crown className="mr-2 h-4 w-4" />
            <span className="text-foreground">Upgrade to Pro</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://github.com/daytimedrinkingclub/shipstation"
              target="_blank"
              rel="noopener noreferrer"
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
        isSubscribed={user.isSubscribed}
        user={user}
      />
      {isChatWidgetOpen && (
        <ChatWidget user={user} onClose={() => setIsChatWidgetOpen(false)} />
      )}
    </>
  );
};

export default UserAccountMenu;
