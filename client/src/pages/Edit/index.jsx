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

import { getLatestShipIdForUser } from "@/lib/utils/editorUtils";

const Edit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userLoading, checkCustomDomain } = useContext(AuthContext);
  const [shipId, setShipId] = useState(location.state?.shipId || null);
  const [isShipIdLoading, setIsShipIdLoading] = useState(
    !location.state?.shipId
  );

  const previewContainerRef = useRef(null);
  const { socket } = useSocket();

  const { readFile, updateFile, submitting, handledownloadzip } =
    useProject(shipId);

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

  const dispatch = useDispatch();
  const isDeploying = useSelector((state) => state.deployment.isDeploying);

  const initialPrompt = location.state?.initialPrompt || "";

  const [customDomain, setCustomDomain] = useState("");
  const [showDNSInstructions, setShowDNSInstructions] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);

  const [customDomainStatus, setCustomDomainStatus] = useState(null);
  const [domainStatus, setDomainStatus] = useState("not_connected");

  useEffect(() => {
    const fetchShipId = async () => {
      if (!userLoading && user && !shipId) {
        setIsShipIdLoading(true);
        try {
          const latestShipId = await getLatestShipIdForUser(user.id);
          if (latestShipId) {
            setShipId(latestShipId);
          } else {
            toast.error("No projects found. Create a new project first.");
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching ship ID:", error);
          toast.error("An error occurred while loading your project.");
          navigate("/");
        } finally {
          setIsShipIdLoading(false);
        }
      } else if (!userLoading && !user) {
        navigate("/");
      }
    };

    fetchShipId();
  }, [user, userLoading, navigate, shipId]);

  useEffect(() => {
    const fetchCustomDomainStatus = async () => {
      if (shipId) {
        const domainData = await checkCustomDomain(shipId);
        setCustomDomainStatus(domainData);
      }
    };

    fetchCustomDomainStatus();
  }, [shipId, checkCustomDomain]);

  const fetchAssets = useCallback(async () => {
    if (isDeploying) return; // Don't fetch assets while deploying

    try {
      const { data, error } = await supabase
        .from("ships")
        .select("assets")
        .eq("slug", shipId)
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
  }, [shipId, isDeploying]);

  useEffect(() => {
    if (!isDeploying && shipId) {
      fetchAssets();
    }
  }, [fetchAssets, isDeploying, shipId]);

  const updateAssets = useCallback((newAssets) => {
    setAssets(newAssets);
    setAssetCount(newAssets.length);
  }, []);

  useEffect(() => {
    if (!userLoading && !isShipIdLoading) {
      if (!user) {
        navigate("/");
      } else if (shipId && !isDeploying) {
        loadIndexHtml();
      } else if (!shipId) {
        navigate("/");
      }
    }
  }, [user, shipId, navigate, userLoading, isShipIdLoading, isDeploying]);

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
    if (!shipId) return;
    setIsFileLoading(true);
    setHasShownErrorToast(false); // Reset the flag before loading
    try {
      const content = await readFile(`${shipId}/index.html`);
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
    updateFile(`${shipId}/index.html`, fileContent, () => {
      toast.success("index.html updated!", {
        description: "Your changes are live 👍",
      });
      if (iframeRef.current) {
        iframeRef.current.reload();
      }
      setUnsavedChanges(false);
    });
  };

  const handleUndo = () => {
    setIsUndoing(true);
    socket.emit("undoCodeChange", { shipId });
  };

  const handleRedo = () => {
    setIsRedoing(true);
    socket.emit("redoCodeChange", { shipId });
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
      position: "bottom-right",
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
          shipSlug: shipId,
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

  if (userLoading || isShipIdLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  if (!user || !shipId) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="mx-auto flex flex-col h-screen p-4 bg-background text-foreground">
        {showConfetti && <Confetti />}

        <Header
          isDeploying={isDeploying}
          shipId={shipId}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
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
                      <TabsTrigger value="assets" className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        <span className="text-sm">Custom Domain</span>
                        {assetCount === 0 ? null : (
                          <Badge
                            variant="default"
                            className="rounded-full ml-2"
                          >
                            {assetCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
                {activeTab === "code" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={handleFileSave}
                    className="text-muted-foreground hover:text-foreground border-border hover:bg-accent"
                  >
                    <Save className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:block">Save</span>
                  </Button>
                )}
              </div>
              <TabsContent value="chat" className="flex-grow overflow-hidden">
                <ChatPanel
                  shipId={shipId}
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
                />
              </TabsContent>
              <TabsContent value="assets" className="flex-grow overflow-hidden">
                <Assets
                  shipId={shipId}
                  assets={assets}
                  onAssetsChange={updateAssets}
                  fetchAssets={fetchAssets}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className={showMobilePreview ? "flex-1" : "hidden"}>
            <PreviewPanel
              currentView={currentView}
              currentDevice={currentDevice}
              iframeRef={iframeRef}
              shipId={shipId}
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
              <ResizablePanel defaultSize={30} minSize={30}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col"
                >
                  <div className="bg-card p-2 flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="chat">AI Chat</TabsTrigger>
                      {!isDeploying && (
                        <>
                          <TabsTrigger value="code">Code</TabsTrigger>
                          <TabsTrigger value="domain">
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
                      shipId={shipId}
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
              defaultSize={currentView === "fullscreen" ? 100 : 70}
            >
              <PreviewPanel
                currentView={currentView}
                currentDevice={currentDevice}
                iframeRef={iframeRef}
                shipId={shipId}
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
