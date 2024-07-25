import { ChannelList, Chat, OverlayProvider } from "stream-chat-expo";
import { StreamChat } from "stream-chat";
import { environment } from "../../environment";
import { useAuth } from "../providers/AuthProvider";

const client = StreamChat.getInstance(environment.EXPO_PUBLIC_STREAM_API_KEY);

export default function Channel() {
  const { user } = useAuth();
  return (
    <OverlayProvider>
      <Chat client={client}>
        <ChannelList filters={{ members: { $in: [user.id] } }} />
      </Chat>
    </OverlayProvider>
  );
}
