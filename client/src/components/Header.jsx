import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { GripIcon, LogIn, LogOut, Ship, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserAccountMenu from "./editor/UserAccountMenu";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "./LoginDialog";

const Header = () => {
  const { user, handleLogout, userLoading } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLoginLogout = async () => {
    if (user) {
      await handleLogout();
    } else {
      onOpen();
    }
  };

  const browseDesignsButton = (
    <Button
      variant="ghost"
      onClick={() =>
        window.open(`${import.meta.env.VITE_MAIN_URL}/showcase`, "_blank")
      }
    >
      <GripIcon className="w-4 h-4 md:mr-2" />
      <span className="hidden md:inline">Browse designs</span>
    </Button>
  );

  return (
    <header className="py-4 bg-background text-foreground">
      <div className="container flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Ship className="w-5 h-5 md:w-6 md:h-6" />
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <span>ShipStation</span>
          </h1>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {browseDesignsButton}
          {user && <UserAccountMenu user={user} onLogout={handleLogout} />}
          {!user && !userLoading && (
            <Button variant="ghost" onClick={handleLoginLogout}>
              Login
            </Button>
          )}
          {userLoading && (
            <div className="w-24 h-8 rounded bg-muted animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center space-x-2">
          {browseDesignsButton}
          <ThemeToggle />
          {user ? (
            <UserAccountMenu
              user={user}
              onLogout={handleLogout}
              isMobile={true}
            />
          ) : (
            <Button variant="ghost" size="icon" onClick={onOpen}>
              <User className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
