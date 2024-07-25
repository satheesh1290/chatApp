import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Channel as ChannelType, ChannelMemberResponse } from "stream-chat";
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from "stream-chat-expo";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ChannelScreen() {
  const [channel, setChannel] = useState<ChannelType | null>();
  const [members, setMembers] = useState<ChannelMemberResponse[]>([]);
  const { cid } = useLocalSearchParams<{ cid: string }>();

  const { client } = useChatContext();

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const channels = await client.queryChannels({ cid });
        const channel = channels[0];
        setChannel(channel);
        const membersResponse = await channel.queryMembers({});
        setMembers(membersResponse.members);
      } catch (error) {
        console.error("Error fetching channel or members:", error);
      }
    };

    fetchChannel();
  }, [cid, client]);

  if (!channel) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: channel.data?.name || "chat",
          headerShown: true,
          headerRight: () => (
            <Link
              href={{
                pathname: "/members",
                params: { cid, members: JSON.stringify(members) },
              }}
            >
              <FontAwesome5
                name="users"
                size={22}
                color="gray"
                style={{ marginHorizontal: 15 }}
              />
            </Link>
          ),
        }}
      />

      <Channel
        channel={channel}
        audioRecordingEnabled
        keyboardVerticalOffset={60}
      >
        <MessageList />
        <SafeAreaView edges={["bottom"]}>
          <MessageInput />
        </SafeAreaView>
      </Channel>
    </>
  );
}
