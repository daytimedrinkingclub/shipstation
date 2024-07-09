import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginDialog from "./LoginDialog";
import useDisclosure from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/button";

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
      <div className="container flex justify-between items-center">
       <div>
       <h1 className="text-2xl font-bold">ShipStation.AI</h1>
        {user && (
          <span className="text-sm">Available Ships: {availableShips}</span>
        )}
       </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleLoginLogout} variant="link" className="text-white">
            {user ? "Logout" : "Login"}
          </Button>
        </div>
      </div>
      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
