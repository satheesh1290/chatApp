import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";
import { useAuth } from "./AuthProvider";
import { generateStreamToken } from "../utils/tokenProvider";
import { environment } from "../../environment";

const client = StreamChat.getInstance(environment.EXPO_PUBLIC_STREAM_API_KEY);

export default function ChatProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    const connect = async () => {
      const userToken = await generateStreamToken(user.id);
      // console.log("Token =>", token);
      await client.connectUser(
        {
          id: user.id,
          name: user.firstName + "," + user.lastName,
          image: user.avatarUrl || "https://via.placeholder.com/100",
        },
        // client.devToken(user.id)
        userToken
      );
      setIsReady(true);

      // const channel = client.channel("messaging", "the_park", {
      //   name: "The Park",
      // });
      // await channel.watch();
    };

    connect();

    return () => {
      if (isReady) {
        client.disconnectUser();
      }
      setIsReady(false);
    };
  }, [user?.id]);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
}
