import { useContext, useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Folder,
  Save,
  ChevronRight,
  ChevronDown,
  Code,
  Download,
  Link,
  ExternalLink,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProject";
import IframePreview, { DEVICE_FRAMES } from "@/components/IframePreview";
import Dice from "@/components/random/Dice";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Edit = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { shipId } = useParams();

  const {
    directoryStructure,
    fetchDirectoryStructure,
    loading: isLoading,
    readFile,
    updateFile,
    submitting,
    handledownloadzip,
  } = useProject(shipId);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [openFolders, setOpenFolders] = useState({});
  const iframeRef = useRef(null);
  const [unsavedChanges, setUnsavedChanges] = useState({});

  const [currentDevice, setCurrentDevice] = useState(DEVICE_FRAMES[0]);

  useEffect(() => {
    if (!user || !shipId) {
      navigate("/");
    } else {
      // Call handleFileSelect with '$shipId/index.html' when the component mounts
      handleFileSelect({ path: `${shipId}/index.html`, name: "index.html" });
    }
  }, [user, shipId, navigate]);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setIsFileLoading(true);
    try {
      // Simulating API call delay
      const content = await readFile(file.path);
      setFileContent(content);
    } catch (error) {
      console.error("Failed to read file:", error);
    } finally {
      setIsFileLoading(false);
    }
    setUnsavedChanges((prev) => ({ ...prev, [file.path]: false }));
  };

  const handleFileChange = (value) => {
    setFileContent(value);
    setUnsavedChanges((prev) => ({ ...prev, [selectedFile.path]: true }));
  };

  const handleFileSave = async () => {
    if (selectedFile) {
      updateFile(selectedFile.path, fileContent, () => {
        toast(`${selectedFile.name} updated!`, {
          description: "Your changes are live 👍",
        });
        if (iframeRef.current) {
          iframeRef.current.reload();
        }
        const currentTimestamp = new Date().toISOString();
        if (selectedFile) {
          selectedFile.lastModified = currentTimestamp;
        }
        setUnsavedChanges((prev) => ({ ...prev, [selectedFile.path]: false }));
      });
    }
  };

  const handleFileDelete = async (file) => {
    fetchDirectoryStructure();
    if (selectedFile && selectedFile.path === file.path) {
      setSelectedFile(null);
      setFileContent("");
    }
  };

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const shuffleDevice = () => {
    const newDevice =
      DEVICE_FRAMES[Math.floor(Math.random() * DEVICE_FRAMES.length)];
    setCurrentDevice(newDevice);
    toast(`Congratulations! 🎉`, {
      description: `You've changed the device to ${newDevice}`,
      position: "top-right",
      duration: 2500,
    });
  };

  const renderDirectory = (items = [], level = 0) => (
    <ul className={`${level === 0 ? "pl-0" : "pl-6"}`}>
      {items.map((item) => (
        <li key={item.path} className="py-1">
          {item.type === "directory" ? (
            <div>
              <button
                className="flex items-center text-gray-300 hover:bg-gray-700 w-full rounded px-2 py-1"
                onClick={() => toggleFolder(item.path)}
              >
                {openFolders[item.path] ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                <Folder className="w-4 h-4 mr-2" />
                {item.name}
              </button>
              {openFolders[item.path] &&
                item.children &&
                renderDirectory(item.children, level + 1)}
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <button
                className={`flex items-center text-left hover:bg-gray-700 w-full rounded px-2 py-1 ${
                  selectedFile && selectedFile.path === item.path
                    ? "bg-gray-700"
                    : ""
                }`}
                onClick={() => handleFileSelect(item)}
              >
                {item.name.endsWith(".js") ? (
                  <span className="mr-2 text-yellow-400 font-bold">JS</span>
                ) : item.name.endsWith(".css") ? (
                  <span className="mr-2 text-blue-400 font-bold">CSS</span>
                ) : (
                  <Code className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="text-gray-300">{item.name}</span>
                {unsavedChanges[item.path] && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              {/* <button
                className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleFileDelete(item)}
              >
                <Trash2 className="w-4 h-4" />
              </button> */}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  if (!user || !shipId) {
    return null;
  }

  return (
    <div className="mx-auto flex flex-row h-screen p-4 bg-black text-gray-100">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 overflow-hidden rounded-lg border border-gray-700"
      >
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <div className="h-full bg-gray-800 p-4 overflow-auto flex flex-col">
            <div className="flex-grow">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                renderDirectory(directoryStructure ?? [])
              )}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handledownloadzip();
                    toast("Project will be downloaded shortly!");
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(
                      `${import.meta.env.VITE_BACKEND_URL}/site/${shipId}/`,
                      "_blank"
                    );
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Link className="w-4 h-4 mr-2" />
                  Link domain
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="h-full flex flex-col bg-gray-900">
            {selectedFile ? (
              <>
                <div className="bg-gray-800 p-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-100">
                      {selectedFile.name}
                    </span>
                    {selectedFile.lastModified && (
                      <span className="text-xs text-gray-400">
                        Last modified:{" "}
                        {format(new Date(selectedFile.lastModified), "PPpp")}
                      </span>
                    )}
                    {unsavedChanges[selectedFile.path] && (
                      <Badge variant="secondary">Unsaved changes</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={handleFileSave}
                    className="text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
                {isFileLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="relative w-16 h-16">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                  </div>
                ) : (
                  <Editor
                    language={
                      selectedFile.name.endsWith(".html")
                        ? "html"
                        : "javascript"
                    }
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "visible",
                      },
                      fontSize: 14,
                      lineNumbers: "on",
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "all",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                    value={fileContent}
                    onChange={handleFileChange}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a file to edit
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="h-full p-4 flex flex-col items-center justify-center">
        <IframePreview device={currentDevice} ref={iframeRef} slug={shipId} />
        <div className="absolute bottom-8 right-8 z-10">
          <Dice animationType="chaotic" onRoll={shuffleDevice} />
        </div>
      </div>
    </div>
  );
};

export default Edit;
