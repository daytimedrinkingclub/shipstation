import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { GripIcon, Images, LogIn, LogOut, Ship, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserAccountMenu from "./editor/UserAccountMenu";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "./LoginDialog";

const Header = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const { isOpen, onClose } = useDisclosure();

  const browseDesignsButton = (
    <Button
      variant="ghost"
      onClick={() =>
        window.open(`${import.meta.env.VITE_MAIN_URL}/showcase`, "_blank")
      }
    >
      <Images className="w-4 h-4 mr-2" />
      <span className="">View showcase</span>
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
            <span>{import.meta.env.VITE_APP_NAME}</span>
          </h1>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {browseDesignsButton}
          {user && <UserAccountMenu user={user} onLogout={handleLogout} />}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center space-x-2">
          {!user && browseDesignsButton}
          <ThemeToggle />
          {user && (
            <UserAccountMenu
              user={user}
              onLogout={handleLogout}
              isMobile={true}
            />
          )}
        </div>
      </div>

      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
