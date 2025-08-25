import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  Undo2,
  Redo2,
  Eye,
  Share2,
  User,
  Pencil,
  Globe,
} from "lucide-react";
import ViewOptions from "./ViewOptions";
import UserAccountMenu from "./UserAccountMenu";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SlugChangeDialog from "./SlugChangeDialog";

const Header = ({
  isDeploying,
  shipSlug,
  handleUndo,
  handleRedo,
  currentView,
  setCurrentView,
  handledownloadzip,
  showMobilePreview,
  setShowMobilePreview,
}) => {
  const { user, handleLogout, userLoading } = useContext(AuthContext);
  const [showUndoDialog, setShowUndoDialog] = useState(false);
  const [showRedoDialog, setShowRedoDialog] = useState(false);
  const [showSlugDialog, setShowSlugDialog] = useState(false);

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleShare = async () => {
    const shareUrl = `${import.meta.env.VITE_MYPROFILE_URL}/${shipSlug}/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my portfolio I made with ${import.meta.env.VITE_APP_NAME}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied to clipboard",
            description: "You can now paste and share it anywhere.",
          });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  const handleUndoClick = () => {
    setShowUndoDialog(true);
  };

  const handleRedoClick = () => {
    setShowRedoDialog(true);
  };

  const confirmUndo = () => {
    handleUndo();
    setShowUndoDialog(false);
  };

  const confirmRedo = () => {
    handleRedo();
    setShowRedoDialog(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center justify-between sm:space-x-4 w-full md:w-auto">
          <h1 className="hidden md:block text-xl font-semibold">
            Customise your site
          </h1>
          <h1 className="md:hidden text-xl font-semibold">
            Customise portfolio
          </h1>
          {!isDeploying && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 hidden md:flex md:w-auto md:px-2"
                onClick={() => {
                  window.open(
                    `${import.meta.env.VITE_MYPROFILE_URL}/${shipSlug}/`,
                    "_blank"
                  );
                }}
              >
                <span className="hidden md:inline">View my site</span>
                <ExternalLink className="w-4 h-4 md:ml-2" />
              </Button>
              {/* Mobile menu */}
              <div className="md:hidden flex items-center space-x-2">
                {user && (
                  <UserAccountMenu
                    user={user}
                    onLogout={handleLogoutClick}
                    isMobile={true}
                  />
                )}
              </div>
            </>
          )}
        </div>
        {!isDeploying && (
          <div className="flex flex-row items-start md:items-center md:space-y-0 md:space-x-2 w-full md:w-auto">
            <div className="flex w-full md:w-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUndoClick}
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
                    onClick={handleRedoClick}
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

              <Button
                variant="outline"
                onClick={handleShare}
                className="w-auto h-10 md:hidden"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <div className="hidden md:flex">
                <ViewOptions
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>

              <Button
                variant="default"
                size="icon"
                className="w-10 h-10 hidden md:w-auto md:px-2"
                onClick={() => {
                  window.open(
                    `${import.meta.env.VITE_MYPROFILE_URL}/${shipSlug}/`,
                    "_blank"
                  );
                }}
              >
                <ExternalLink className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Preview Live Site</span>
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSlugDialog(true)}
                    className="w-10 h-10 md:w-auto md:px-2"
                  >
                    <Globe className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline"> Change Slug</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Change Slug</TooltipContent>
              </Tooltip>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <UserAccountMenu user={user} onLogout={handleLogoutClick} />
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Undo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to undo the last change?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUndo}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRedoDialog} onOpenChange={setShowRedoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Redo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redo the last undone change?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRedo}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SlugChangeDialog
        open={showSlugDialog}
        onOpenChange={setShowSlugDialog}
      />
    </>
  );
};

export default Header;
