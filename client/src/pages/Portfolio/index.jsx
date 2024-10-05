import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioBuilder from "@/components/portfolio-builder/PortfolioBuilder";
import { AuthContext } from "@/context/AuthContext";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "@/components/LoginDialog";
import AppLayout from "@/components/layout/AppLayout";
import { getLatestShipIdForUser } from "@/lib/utils/editorUtils";

const Portfolio = () => {
  const navigate = useNavigate();
  const { user, userLoading } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCheckingProject, setIsCheckingProject] = useState(true);

  useEffect(() => {
    const checkExistingProject = async () => {
      if (!userLoading) {
        if (user) {
          try {
            const latestShipId = await getLatestShipIdForUser(user.id);
            if (latestShipId) {
              navigate("/editor", { state: { shipId: latestShipId } });
            }
          } catch (error) {
            console.error("Error checking for existing project:", error);
          } finally {
            setIsCheckingProject(false);
          }
        } else {
          setIsCheckingProject(false);
          onOpen();
        }
      }
    };

    checkExistingProject();
  }, [user, userLoading, navigate, onOpen]);

  if (userLoading || isCheckingProject) {
    return <AppLayout>Loading...</AppLayout>;
  }

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
