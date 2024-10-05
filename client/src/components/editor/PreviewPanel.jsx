import IframePreview from "@/components/IframePreview";
import LoaderCircle from "./LoaderCircle";
import Dice from "@/components/random/Dice";

const PreviewPanel = ({
  currentView,
  currentDevice,
  iframeRef,
  shipId,
  isFileLoading,
  isDeploying,
  isUndoing,
  isRedoing,
  isCodeUpdating,
  isChatUpdating,
  shuffleDevice,
}) => {
  return (
    <div className="h-full overflow-hidden relative">
      <IframePreview
        device={currentView === "mobile" ? currentDevice : null}
        ref={iframeRef}
        slug={shipId}
        currentView={currentView}
        isLoading={isFileLoading}
        isDeploying={isDeploying}
      />
      {(isUndoing || isRedoing || isCodeUpdating || isChatUpdating) && (
        <LoaderCircle />
      )}
      {currentView === "mobile" && (
        <div className="absolute bottom-8 right-8 z-10">
          <Dice onRoll={shuffleDevice} />
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
