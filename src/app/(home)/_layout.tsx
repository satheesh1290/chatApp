import { Redirect, Slot, Stack } from "expo-router";
import { Text } from "react-native";
import { StreamChat } from "stream-chat";
import { environment } from "../../../environment";
import { useAuth } from "../../providers/AuthProvider";
import ChatProvider from "../../providers/ChatProviders";
import VideoProvider from "../../providers/VideoProvider";

const client = StreamChat.getInstance(environment.EXPO_PUBLIC_STREAM_API_KEY);

export default function HomeLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ChatProvider>
      <VideoProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </VideoProvider>
    </ChatProvider>
  );
}
