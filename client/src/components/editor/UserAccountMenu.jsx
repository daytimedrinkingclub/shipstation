import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, LogOut, UserIcon } from "lucide-react";
import SubscriptionDialog from "@/components/SubscriptionDialog";

const UserAccountMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);

  const handleOpenSubscriptionDialog = () => {
    setIsSubscriptionDialogOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem onSelect={handleOpenSubscriptionDialog}>
            <Crown className="mr-2 h-4 w-4" />
            <span className="text-foreground">Subscription</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span className="text-foreground">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SubscriptionDialog
        isOpen={isSubscriptionDialogOpen}
        onClose={() => setIsSubscriptionDialogOpen(false)}
        isSubscribed={user.isSubscribed}
        user={user} // Pass the user object
      />
    </>
  );
};

export default UserAccountMenu;
