import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download } from "lucide-react";

const CodeEditor = ({
  fileContent,
  isFileLoading,
  handleFileChange,
  handleFileSave,
  unsavedChanges,
  submitting,
  handledownloadzip, // Add this prop
}) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">index.html</span>
          {unsavedChanges && <Badge variant="secondary">Unsaved changes</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={handledownloadzip} 
            className="text-muted-foreground hover:text-foreground border-border hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={handleFileSave}
            className="text-muted-foreground hover:text-foreground border-border hover:bg-accent"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      {isFileLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-muted rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-primary rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <Editor
          language="html"
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
    </div>
  );
};

export default CodeEditor;
