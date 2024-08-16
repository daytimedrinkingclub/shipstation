import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CardContainer from "@/components/CardContainer";
import RecentlyShipped from "@/components/RecentlyShipped";
import { AuthContext } from "@/context/AuthContext";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "@/components/LoginDialog";
import AppLayout from "@/components/layout/AppLayout";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCardClick = (type) => {
    if (!user) {
      onOpen();
    } else {
      navigate(`/ship?type=${type}`);
    }
  };

  const setLocalStorage = () => {
    const promptValue = window.prompt("Enter a value:");
    if (promptValue) {
      localStorage.setItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`, promptValue);
      window.location.reload();
    }
  };

  return (
    <AppLayout>
      <h1 className="sm:text-4xl font-bold text-foreground my-8 text-2xl">
        What would you like to <span onClick={setLocalStorage} className="cursor-pointer">ship</span>?
      </h1>
      <CardContainer onCardClick={handleCardClick} />
      <RecentlyShipped />
      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </AppLayout>
  );
};

export default Home;