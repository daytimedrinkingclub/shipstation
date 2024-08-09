import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginDialog from "./LoginDialog";
import useDisclosure from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Ship, User } from "lucide-react";

const Header = () => {
  const { user, availableShips, handleLogout, userLoading } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLoginLogout = async () => {
    if (user) {
      await handleLogout();
    } else {
      onOpen();
    }
  };

  const handleViewAllShips = () => {
    window.open(`${import.meta.env.VITE_BACKEND_URL}/all`, "_blank");
  };

  return (
    <header className="py-4 text-white">
      <div className="container flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Ship className="w-6 h-6" />
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => window.location.href = "/"}>ShipStation</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user && <div className="hidden sm:flex items-center">
            <User className="w-4 h-4 mr-2" /> {user?.email}
          </div>}
          {userLoading ? (
            <Button variant="link" className="animate-pulse">
              <div className="w-24 h-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded"></div>
            </Button>
          ) : (
            <Button variant="link" onClick={handleLoginLogout}>
              {user ? (
                <LogOut className="w-4 h-4 mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {user ? "Log out" : "Login or Sign up"}
            </Button>
          )}
        </div>
      </div>
      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
