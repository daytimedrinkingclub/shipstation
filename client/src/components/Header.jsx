import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginDialog from "./LoginDialog";
import useDisclosure from "@/hooks/useDisclosure";

const Header = () => {
  const { user, supabase } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLoginLogout = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      onOpen();
    }
  };

  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">ShipStation.AI</h1>
        <button
          onClick={handleLoginLogout}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {user ? "Logout" : "Login"}
        </button>
      </div>

      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </header>
  );
};

export default Header;
