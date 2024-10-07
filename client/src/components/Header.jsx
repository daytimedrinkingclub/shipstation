import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginDialog from "./LoginDialog";
import useDisclosure from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/button";
import { GripIcon, LogIn, LogOut, Ship, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserAccountMenu from "./editor/UserAccountMenu";

const Header = () => {
  const { user, availableShips, handleLogout, userLoading } =
    useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLoginLogout = async () => {
    if (user) {
      await handleLogout();
    } else {
      onOpen();
    }
  };

  return (
    <header className="py-4 bg-background text-foreground">
      <div className="container flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Ship className="w-6 h-6" />
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            ShipStation
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={() =>
              window.open(`${import.meta.env.VITE_MAIN_URL}/showcase`, "_blank")
            }
          >
            <GripIcon className="w-4 h-4 mr-2" />
            Browse designs
          </Button>
          {userLoading ? (
            <div className="w-24 h-8 rounded bg-muted animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          ) : (
            <>
              {user && <UserAccountMenu user={user} onLogout={handleLogout} />}
            </>
          )}
        </div>
      </div>
      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
