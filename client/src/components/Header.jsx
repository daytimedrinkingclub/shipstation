import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginDialog from "./LoginDialog";
import useDisclosure from "@/hooks/useDisclosure";
import { Button } from "./ui/button";

const Header = () => {
  const { user, availableShips, handleLogout } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLoginLogout = async () => {
    if (user) {
      await handleLogout();
    } else {
      onOpen();
    }
  };

  return (
    <header className="p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">ShipStation.AI</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm">Available Ships: {availableShips}</span>
          )}
          <Button onClick={handleLoginLogout}>
            {user ? "Logout" : "Login"}
          </Button>
        </div>
      </div>
      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
