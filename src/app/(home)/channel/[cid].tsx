import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Modal,
  Pressable,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Channel as ChannelType,
  ChannelMemberResponse,
  UserResponse,
} from "stream-chat";
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from "stream-chat-expo";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";

export default function ChannelScreen() {
  const [channel, setChannel] = useState<ChannelType | null>();
  const [isGroupChannel, setIsGroupChannel] = useState(false);
  const [members, setMembers] = useState<ChannelMemberResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nonExistingMembers, setNonExistingMembers] = useState<UserResponse[]>(
    []
  );

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
        const membersCount = membersResponse.members.length;
        setIsGroupChannel(membersCount > 2);
      } catch (error) {
        console.error("Error fetching channel or members:", error);
      }
    };

    fetchChannel();
  }, [cid, client]);

  const handleAddMemberPress = async () => {
    try {
      const existingMemberIds = members.map((member) => member.user.id);
      const allMembersResponse = await client.queryUsers({
        id: { $nin: existingMemberIds },
      });
      setNonExistingMembers(allMembersResponse.users);
      const nonexitingId = nonExistingMembers.map((member) => member.id);

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching non-existing members:", error);
    }
  };

  const handleAddMember = async (member) => {
    try {
      await channel.addMembers([member.id]);
      Alert.alert("Success", `${member.name} has been added to the channel.`);
      setMembers((prevMembers) => [
        ...prevMembers,
        { user: member } as ChannelMemberResponse,
      ]);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (member: ChannelMemberResponse) => {
    try {
      if (channel) {
        await channel.removeMembers([member.user.id]);
        Alert.alert(
          "Success",
          `${member.user.name} has been removed from the channel.`
        );
        setMembers((prevMembers) =>
          prevMembers.filter((m) => m.user.id !== member.user.id)
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {isGroupChannel && (
                <Pressable onPress={handleAddMemberPress}>
                  <AntDesign
                    name="adduser"
                    size={22}
                    color="black"
                    style={{ marginHorizontal: 15 }}
                  />
                </Pressable>
              )}
              <Ionicons
                name="call"
                size={22}
                color="gray"
                style={{ marginHorizontal: 15 }}
              />
            </View>
          ),
        }}
      />

      <Channel channel={channel} audioRecordingEnabled>
        <MessageList />
        <SafeAreaView edges={["bottom"]}>
          <MessageInput />
        </SafeAreaView>
      </Channel>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={{ flex: 1, padding: 15 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Channel Members
            </Text>
            <FlatList
              data={members}
              keyExtractor={(item) => item.user.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc",
                    flexDirection: "row",
                  }}
                >
                  <Text style={{ fontWeight: "600", paddingRight: 15 }}>
                    {item.user.name}
                  </Text>
                  <Pressable onPress={() => handleRemoveMember(item)}>
                    <AntDesign name="closecircle" size={24} color="red" />
                  </Pressable>
                </View>
              )}
            />
            {/* </View>
          <View style={{ flex: 1, padding: 15 }}> */}
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Non-Existing Members:
            </Text>
            <FlatList
              data={nonExistingMembers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc",
                    flexDirection: "row",
                  }}
                >
                  <Text style={{ fontWeight: "600", paddingRight: 15 }}>
                    {item.name}
                  </Text>
                  <Pressable onPress={() => handleAddMember(item)}>
                    <Ionicons name="add-circle" size={22} color="green" />
                  </Pressable>
                </View>
              )}
            />
            <Pressable
              onPress={() => setShowModal(false)}
              style={{
                marginTop: 20,
                padding: 10,
                backgroundColor: "gray",
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
