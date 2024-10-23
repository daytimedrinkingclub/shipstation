import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSocket } from "@/context/SocketProvider";
import { AuthContext } from "@/context/AuthContext";
import { useProject } from "@/hooks/useProject";
import { useSelector, useDispatch } from "react-redux";
import { setIsDeploying } from "@/store/deploymentSlice";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { supabase } from "@/lib/supabaseClient";
import axios from "axios";

import Header from "@/components/editor/Header";
import CodeEditor from "@/components/editor/CodeEditor";
import ChatPanel from "@/components/editor/ChatPanel";
import PreviewPanel from "@/components/editor/PreviewPanel";
import DomainPanel from "@/components/editor/DomainPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Assets from "@/components/Assets";
import { DEVICE_FRAMES } from "@/components/IframePreview";
import { Badge, Code, Globe, Save } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { getLatestShipInfoForUser } from "@/lib/utils/editorUtils";

import Lottie from "react-lottie-player";
import shipAnimation from "@/assets/lottie/ship.json";
import { setShipInfo } from "@/store/shipSlice";

const Edit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, userLoading, checkCustomDomain } = useContext(AuthContext);
  const shipInfo = useSelector((state) => state.ship);
  const [isShipInfoLoading, setIsShipInfoLoading] = useState(
    !location.state?.shipId
  );

  useEffect(() => {
    if (location.state?.shipId && location.state?.shipSlug) {
      dispatch(
        setShipInfo({
          id: location.state.shipId,
          slug: location.state.shipSlug,
        })
      );
    }
  }, [location.state, dispatch]);

  useEffect(() => {
    console.log("Edit component - shipInfo updated:", shipInfo);
  }, [shipInfo]);

  const initialPrompt = location.state?.initialPrompt || "";

  const previewContainerRef = useRef(null);
  const { socket } = useSocket();

  const { readFile, updateFile, submitting, handledownloadzip } = useProject(
    shipInfo.slug
  );

  const [fileContent, setFileContent] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(true);
  const iframeRef = useRef(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [currentDevice, setCurrentDevice] = useState(DEVICE_FRAMES[0]);
  const [activeTab, setActiveTab] = useState("chat");
  const [currentView, setCurrentView] = useState("horizontal");
  const [hasShownErrorToast, setHasShownErrorToast] = useState(false);

  const [isCodeUpdating, setIsCodeUpdating] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isRedoing, setIsRedoing] = useState(false);
  const [isChatUpdating, setIsChatUpdating] = useState(false);

  const [assets, setAssets] = useState([]);
  const [assetCount, setAssetCount] = useState(0);

  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [isWebsiteDeployed, setIsWebsiteDeployed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isDeploying = useSelector((state) => state.deployment.isDeploying);

  const [customDomain, setCustomDomain] = useState("");
  const [showDNSInstructions, setShowDNSInstructions] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);

  const [customDomainStatus, setCustomDomainStatus] = useState(null);
  const [domainStatus, setDomainStatus] = useState("not_connected");

  const [leftPanelSize, setLeftPanelSize] = useState(30);
  const resizablePanelRef = useRef(null);

  useEffect(() => {
    if (currentView === "mobile") {
      setLeftPanelSize(50);
    } else if (currentView === "horizontal") {
      setLeftPanelSize(30);
    }
  }, [currentView]);

  useEffect(() => {
    if (resizablePanelRef.current) {
      resizablePanelRef.current.resize(leftPanelSize);
    }
  }, [leftPanelSize]);

  useEffect(() => {
    const fetchShipInfo = async () => {
      if (!userLoading && user && !shipInfo.id) {
        setIsShipInfoLoading(true);
        try {
          const latestShipInfo = await getLatestShipInfoForUser(user.id);
          if (latestShipInfo) {
            dispatch(
              setShipInfo({
                id: latestShipInfo.id,
                slug: latestShipInfo.slug,
              })
            );
          } else {
            toast.error("No projects found. Create a new project first.");
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching ship info:", error);
          toast.error("An error occurred while loading your project.");
          navigate("/");
        } finally {
          setIsShipInfoLoading(false);
        }
      } else if (!userLoading && !user) {
        navigate("/");
      }
    };

    fetchShipInfo();
  }, [user, userLoading, navigate, shipInfo.id, dispatch]);

  useEffect(() => {
    const fetchCustomDomainStatus = async () => {
      if (shipInfo.id) {
        const domainData = await checkCustomDomain(shipInfo.id);
        setCustomDomainStatus(domainData);
      }
    };

    fetchCustomDomainStatus();
  }, [shipInfo.id, checkCustomDomain]);

  const fetchAssets = useCallback(async () => {
    if (isDeploying) return; // Don't fetch assets while deploying

    try {
      const { data, error } = await supabase
        .from("ships")
        .select("assets")
        .eq("id", shipInfo.id)
        .single();

      if (error) throw error;

      let parsedAssets = [];
      if (data && data.assets) {
        if (Array.isArray(data.assets)) {
          parsedAssets = data.assets;
        } else if (typeof data.assets === "string") {
          try {
            const parsed = JSON.parse(data.assets);
            parsedAssets = Array.isArray(parsed) ? parsed : [];
          } catch (parseError) {
            console.error("Error parsing assets JSON:", parseError);
          }
        }
      }
      setAssets(parsedAssets);
      setAssetCount(parsedAssets.length);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
      setAssetCount(0);
    }
  }, [shipInfo.id, isDeploying]);

  useEffect(() => {
    if (!isDeploying && shipInfo.id) {
      fetchAssets();
    }
  }, [fetchAssets, isDeploying, shipInfo.id]);

  const updateAssets = useCallback((newAssets) => {
    setAssets(newAssets);
    setAssetCount(newAssets.length);
  }, []);

  useEffect(() => {
    if (!userLoading && !isShipInfoLoading) {
      if (!user) {
        navigate("/");
      } else if (shipInfo.id && !isDeploying) {
        loadIndexHtml();
      } else if (!shipInfo.id) {
        navigate("/");
      }
    }
  }, [
    user,
    shipInfo.id,
    navigate,
    userLoading,
    isShipInfoLoading,
    isDeploying,
  ]);

  useEffect(() => {
    const preventScroll = (e) => {
      if (currentView !== "fullscreen" && currentView !== "mobile") {
        e.preventDefault();
      }
    };

    const container = previewContainerRef.current;
    if (container) {
      container.addEventListener("wheel", preventScroll, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", preventScroll);
      }
    };
  }, [currentView]);

  const loadIndexHtml = async () => {
    if (!shipInfo.slug) return;
    setIsFileLoading(true);
    setHasShownErrorToast(false); // Reset the flag before loading
    try {
      const content = await readFile(`${shipInfo.slug}/index.html`);
      setFileContent(content);
    } catch (error) {
      console.error("Failed to read index.html:", error);
      if (!hasShownErrorToast) {
        toast.error("Failed to load index.html");
        setHasShownErrorToast(true);
      }
    } finally {
      setIsFileLoading(false);
    }
    setUnsavedChanges(false);
  };

  const handleFileChange = (value) => {
    setFileContent(value);
    setUnsavedChanges(true);
  };

  const handleFileSave = async () => {
    updateFile(`${shipInfo.slug}/index.html`, fileContent, () => {
      toast.success("index.html updated!", {
        description: "Your changes are live 👍",
      });
      if (iframeRef.current) {
        iframeRef.current.reload();
      }
      setUnsavedChanges(false);
    });
  };

  const handleUndoConfirm = () => {
    setIsUndoing(true);
    socket.emit("undoCodeChange", {
      shipId: shipInfo.id,
      shipSlug: shipInfo.slug,
    });
  };

  const handleRedoConfirm = () => {
    setIsRedoing(true);
    socket.emit("redoCodeChange", {
      shipId: shipInfo.id,
      shipSlug: shipInfo.slug,
    });
  };

  const handleUndoResult = (result) => {
    setIsUndoing(false);
    if (result.success) {
      toast.success(result.message);
      setFileContent(result.code);
      if (iframeRef.current) {
        iframeRef.current.reload();
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleRedoResult = (result) => {
    setIsRedoing(false);
    if (result.success) {
      toast.success(result.message);
      setFileContent(result.code);
      if (iframeRef.current) {
        iframeRef.current.reload();
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleCodeUpdate = (updatedCode) => {
    setIsCodeUpdating(true);
    setFileContent(updatedCode);
    setUnsavedChanges(false);
    if (iframeRef.current) {
      iframeRef.current.reload();
    }
    setTimeout(() => setIsCodeUpdating(false), 1000);
  };

  const handleChatUpdate = (updatedCode) => {
    setIsChatUpdating(true);
    setFileContent(updatedCode);
    setUnsavedChanges(false);
    if (iframeRef.current) {
      iframeRef.current.reload();
    }
    setTimeout(() => setIsChatUpdating(false), 1000);
  };

  useEffect(() => {
    if (socket) {
      socket.on("undoResult", handleUndoResult);
      socket.on("redoResult", handleRedoResult);
      socket.on("codeUpdate", handleCodeUpdate);
      socket.on("websiteDeployed", handleWebsiteDeployed);
      socket.on("project_started", () => dispatch(setIsDeploying(true)));

      return () => {
        socket.off("undoResult", handleUndoResult);
        socket.off("redoResult", handleRedoResult);
        socket.off("codeUpdate", handleCodeUpdate);
        socket.off("websiteDeployed", handleWebsiteDeployed);
        socket.off("project_started");
      };
    }
  }, [socket, dispatch]);

  const shuffleDevice = () => {
    const newDevice =
      DEVICE_FRAMES[Math.floor(Math.random() * DEVICE_FRAMES.length)];
    setCurrentDevice(newDevice);
    toast(`Congratulations! 🎉`, {
      description: `You've changed the device to ${newDevice}`,
      position: "top-right",
      duration: 1500,
    });
  };

  const handleAssetsUpdate = (newAssets) => {
    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
    setAssetCount((prevCount) => prevCount + newAssets.length);
  };

  const handleWebsiteDeployed = useCallback(() => {
    setIsWebsiteDeployed(true);
    dispatch(setIsDeploying(false));
    setShowConfetti(true);
    toast.success("Your website has been deployed!");
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, [dispatch]);

  const handleCustomDomainSubmit = (e) => {
    e.preventDefault();
    setShowDNSInstructions(true);
  };

  const handleConfirmDomain = async () => {
    setIsConnectingDomain(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/add-custom-domain`,
        {
          domain: customDomain,
          shipSlug: shipInfo.slug,
        }
      );

      if (response.status === 200) {
        setShowConfirmationDialog(true);
        setDomainStatus("pending");
        toast.success("Custom domain connection initiated successfully!");
      } else {
        throw new Error("Failed to connect custom domain");
      }
    } catch (error) {
      console.error("Error connecting custom domain:", error);
      toast.error("Failed to connect custom domain. Please try again.");
    } finally {
      setIsConnectingDomain(false);
    }
  };

  if (userLoading || isShipInfoLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Lottie
          animationData={shipAnimation}
          style={{ width: 200, height: 200 }}
          loop={true}
          play={true}
        />
      </div>
    );
  }

  if (!user || !shipInfo.id) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="mx-auto flex flex-col h-screen p-4 bg-background text-foreground">
        {showConfetti && <Confetti />}

        <Header
          isDeploying={isDeploying}
          shipSlug={shipInfo.slug}
          handleUndo={handleUndoConfirm}
          handleRedo={handleRedoConfirm}
          currentView={currentView}
          setCurrentView={setCurrentView}
          handledownloadzip={handledownloadzip}
          showMobilePreview={showMobilePreview}
          setShowMobilePreview={setShowMobilePreview}
        />

        <div className="md:hidden flex flex-col flex-1 overflow-hidden rounded-lg border border-border">
          <div className={showMobilePreview ? "hidden" : "flex-1"}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="bg-card p-2 flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="chat" className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Chat
                  </TabsTrigger>
                  {!isDeploying && (
                    <>
                      <TabsTrigger value="code" className="flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger value="domain" className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        <span className="text-sm">Custom Domain</span>
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>
              <TabsContent value="chat" className="flex-grow overflow-hidden">
                <ChatPanel
                  onCodeUpdate={handleChatUpdate}
                  onAssetsUpdate={handleAssetsUpdate}
                  assets={assets}
                  assetCount={assetCount}
                  initialPrompt={initialPrompt}
                  isDeploying={isDeploying}
                />
              </TabsContent>
              <TabsContent value="code" className="flex-grow overflow-hidden">
                <CodeEditor
                  fileContent={fileContent}
                  isFileLoading={isFileLoading}
                  handleFileChange={handleFileChange}
                  handleFileSave={handleFileSave}
                  unsavedChanges={unsavedChanges}
                  submitting={submitting}
                  handledownloadzip={handledownloadzip}
                />
              </TabsContent>
              <TabsContent value="domain" className="flex-grow overflow-hidden">
                <DomainPanel
                  customDomain={customDomain}
                  setCustomDomain={setCustomDomain}
                  handleCustomDomainSubmit={handleCustomDomainSubmit}
                  showDNSInstructions={showDNSInstructions}
                  handleConfirmDomain={handleConfirmDomain}
                  isConnectingDomain={isConnectingDomain}
                  domainStatus={domainStatus}
                  customDomainStatus={customDomainStatus}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className={showMobilePreview ? "flex-1" : "hidden"}>
            <PreviewPanel
              currentView={currentView}
              currentDevice={currentDevice}
              iframeRef={iframeRef}
              shipSlug={shipInfo.slug}
              shipId={shipInfo.id}
              isFileLoading={isFileLoading}
              isDeploying={isDeploying}
              isUndoing={isUndoing}
              isRedoing={isRedoing}
              isCodeUpdating={isCodeUpdating}
              isChatUpdating={isChatUpdating}
              shuffleDevice={shuffleDevice}
            />
          </div>
        </div>

        <div className="hidden md:block flex-1">
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 overflow-hidden rounded-lg border border-border"
          >
            {currentView !== "fullscreen" && (
              <ResizablePanel
                ref={resizablePanelRef}
                defaultSize={leftPanelSize}
                minSize={currentView === "mobile" ? 50 : 30}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col"
                >
                  <div className="bg-card p-2 flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="chat">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        AI Chat
                      </TabsTrigger>
                      {!isDeploying && (
                        <>
                          <TabsTrigger value="code">
                            <Code className="w-4 h-4 mr-2" />
                            Code
                          </TabsTrigger>
                          <TabsTrigger value="domain">
                            <Globe className="w-4 h-4 mr-2" />
                            Custom Domain
                          </TabsTrigger>
                        </>
                      )}
                    </TabsList>
                  </div>
                  <TabsContent
                    value="chat"
                    className="flex-grow overflow-hidden"
                  >
                    <ChatPanel
                      onCodeUpdate={handleChatUpdate}
                      onAssetsUpdate={handleAssetsUpdate}
                      assets={assets}
                      assetCount={assetCount}
                      initialPrompt={initialPrompt}
                      isDeploying={isDeploying}
                    />
                  </TabsContent>
                  <TabsContent
                    value="code"
                    className="flex-grow overflow-hidden"
                  >
                    <CodeEditor
                      fileContent={fileContent}
                      isFileLoading={isFileLoading}
                      handleFileChange={handleFileChange}
                      handleFileSave={handleFileSave}
                      unsavedChanges={unsavedChanges}
                      submitting={submitting}
                      handledownloadzip={handledownloadzip}
                    />
                  </TabsContent>
                  <TabsContent
                    value="domain"
                    className="flex-grow overflow-hidden p-4"
                  >
                    <DomainPanel
                      customDomain={customDomain}
                      setCustomDomain={setCustomDomain}
                      handleCustomDomainSubmit={handleCustomDomainSubmit}
                      showDNSInstructions={showDNSInstructions}
                      handleConfirmDomain={handleConfirmDomain}
                      isConnectingDomain={isConnectingDomain}
                      domainStatus={domainStatus}
                      customDomainStatus={customDomainStatus}
                    />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            )}
            {currentView !== "fullscreen" && <ResizableHandle withHandle />}
            <ResizablePanel
              defaultSize={
                currentView === "fullscreen"
                  ? 100
                  : currentView === "mobile"
                  ? 50
                  : 70
              }
            >
              <PreviewPanel
                currentView={currentView}
                currentDevice={currentDevice}
                iframeRef={iframeRef}
                shipId={shipInfo.id}
                isFileLoading={isFileLoading}
                isDeploying={isDeploying}
                isUndoing={isUndoing}
                isRedoing={isRedoing}
                isCodeUpdating={isCodeUpdating}
                isChatUpdating={isChatUpdating}
                shuffleDevice={shuffleDevice}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <Dialog
          open={showConfirmationDialog}
          onOpenChange={setShowConfirmationDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Domain Connection in Progress</DialogTitle>
              <DialogDescription>
                Your custom domain ({customDomain}) is being connected to your
                portfolio. This process may take up to 24 hours to complete.
                We'll send you an email confirmation once it's live.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowConfirmationDialog(false)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Edit;
