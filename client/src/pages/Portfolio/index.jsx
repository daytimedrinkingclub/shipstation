import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioBuilder from "@/components/portfolio-builder/PortfolioBuilder";
import { AuthContext } from "@/context/AuthContext";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "@/components/LoginDialog";
import AppLayout from "@/components/layout/AppLayout";

const Portfolio = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!user) {
      onOpen();
    }
  }, [user, onOpen]);

  if (!user) {
    return (
      <AppLayout>
        <LoginDialog
          isOpen={isOpen}
          onClose={() => {
            onClose();
            navigate("/");
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PortfolioBuilder />
    </AppLayout>
  );
};

export default Portfolio;
