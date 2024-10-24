import Chat from "@/components/Chat";
import { useSelector } from "react-redux";

const ChatPanel = ({
  onCodeUpdate,
  onAssetsUpdate,
  assets,
  assetCount,
  initialPrompt,
  isDeploying,
}) => {
  const { id: shipId, slug: shipSlug } = useSelector((state) => state.ship);

  console.log("ChatPanel", { shipId, shipSlug });

  return (
    <Chat
      shipSlug={shipSlug}
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
