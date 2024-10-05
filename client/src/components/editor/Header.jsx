import { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  Download,
  ExternalLink,
  Undo2,
  Redo2,
  Eye,
} from "lucide-react";
import ViewOptions from "./ViewOptions";
import UserAccountMenu from "./UserAccountMenu";
import { AuthContext } from "@/context/AuthContext";

const Header = ({
  isDeploying,
  shipId,
  handleUndo,
  handleRedo,
  currentView,
  setCurrentView,
  handledownloadzip,
  showMobilePreview,
  setShowMobilePreview,
}) => {
  const { user, handleLogout } = useContext(AuthContext);

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <h1 className="text-xl font-semibold">Customise your portfolio</h1>
      </div>
      {!isDeploying && (
        <div className="flex flex-row items-start md:items-center md:space-y-0 md:space-x-2 w-full md:w-auto">
          <div className="flex w-full md:w-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  className="w-10 h-10 px-2 rounded-l-md rounded-r-none"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  className="w-10 h-10 px-2 rounded-l-none rounded-r-md -ml-px"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-row items-center space-x-2">
            <Button
              variant={`${showMobilePreview ? "default" : "outline"}`}
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="w-auto h-10 md:hidden"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <div className="hidden md:flex">
              <ViewOptions
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 md:w-auto md:px-2"
              onClick={() => {
                handledownloadzip();
                toast("Project will be downloaded shortly!");
              }}
            >
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Export Project</span>
            </Button>

            <Button
              variant="default"
              size="icon"
              className="w-10 h-10 md:w-auto md:px-2"
              onClick={() => {
                window.open(
                  `${import.meta.env.VITE_MAIN_URL}/site/${shipId}/`,
                  "_blank"
                );
              }}
            >
              <ExternalLink className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Preview Live Site</span>
            </Button>
            <UserAccountMenu user={user} onLogout={handleLogoutClick} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
