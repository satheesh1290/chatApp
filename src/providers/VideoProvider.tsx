import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { environment } from "../../environment";
import { useAuth } from "./AuthProvider";
import { generateStreamToken } from "../utils/tokenProvider";

const apiKey = environment.EXPO_PUBLIC_STREAM_API_KEY;

export default function VideoProvider({ children }: PropsWithChildren) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );
  const { user: profile } = useAuth();

  useEffect(() => {
    if (!profile) {
      return;
    }
    const initVideoProvider = async () => {
      const user = {
        id: profile.id,
        name: profile.firstName + "," + profile.lastName,
        image: profile.avatarUrl || "https://via.placeholder.com/100",
      };
      const token = await generateStreamToken(user.id);
      const client = new StreamVideoClient({ apiKey, user, token });
      setVideoClient(client);
    };

    initVideoProvider();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [profile?.id]);

  if (!videoClient) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
