import Chat from "@/components/Chat";

const ChatPanel = ({
  shipId,
  onCodeUpdate,
  onAssetsUpdate,
  assets,
  assetCount,
  initialPrompt,
  isDeploying,
}) => {
  return (
    <Chat
      shipId={shipId}
      onCodeUpdate={onCodeUpdate}
      onAssetsUpdate={onAssetsUpdate}
      assets={assets}
      assetCount={assetCount}
      initialPrompt={initialPrompt}
      isDeploying={isDeploying}
    />
  );
};

export default ChatPanel;
