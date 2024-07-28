import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useQuery } from "@apollo/client";
import UserListItem from "../../components/UserListItem";
import { useAuth } from "../../providers/AuthProvider";
import { useChatContext } from "stream-chat-expo";
import { GET_USERS } from "../../shared/API/users_fetch";
import { router } from "expo-router";

export default function UserScreen() {
  const { user } = useAuth();
  const { client } = useChatContext();
  const { loading, error, data } = useQuery(GET_USERS);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");

  const toggleUserSelection = (userId: string, chatName: string) => {
    if (!isGroupMode) {
      startPersonalChat(userId, chatName);
    } else {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.includes(userId)
          ? prevSelectedUsers.filter((id) => id !== userId)
          : [...prevSelectedUsers, userId]
      );
    }
  };

  const startPersonalChat = async (userId: string, chatName: string) => {
    const channel = client.channel("messaging", {
      name: chatName,
      members: [user.id, userId],
      distinct: false,
    });
    await channel.watch();
    router.replace(`/(home)/channel/${channel.cid}`);
  };

  const addGroup = async () => {
    if (selectedUsers.length < 1) {
      Alert.alert("Select at least 1 user to create a group.");
      return;
    }
    if (!groupName.trim()) {
      Alert.alert("Please enter a group name.");
      return;
    }

    try {
      const channelId = `group-${Date.now()}`; // Unique channel ID
      const channel = client.channel("messaging", channelId, {
        name: groupName.trim(),
        members: [user.id, ...selectedUsers],
        distinct: false,
      });
      await channel.watch();
      router.replace(`/(home)/channel/${channel.cid}`);
      setSelectedUsers([]);
      setGroupName("");
      setIsGroupMode(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const users = data ? data.allUsers.filter((u) => u.id !== user.id) : [];

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList
        data={users}
        contentContainerStyle={{ gap: 5 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            isSelected={selectedUsers.includes(item.id)}
            onSelect={() => toggleUserSelection(item.id, item.username)}
          />
        )}
      />
      <Pressable
        onPress={() => setIsGroupMode(!isGroupMode)}
        style={{ padding: 15, backgroundColor: "white", marginTop: 10 }}
      >
        <Text style={{ fontWeight: "600" }}>
          {isGroupMode ? "Cancel Group" : "Create Group"}
        </Text>
      </Pressable>
      {isGroupMode && (
        <>
          <TextInput
            placeholder="Group Name"
            value={groupName}
            onChangeText={setGroupName}
            style={{
              borderColor: "#ccc",
              borderWidth: 1,
              padding: 10,
              marginTop: 10,
            }}
          />
          <Pressable
            onPress={addGroup}
            style={{ padding: 15, backgroundColor: "white", marginTop: 10 }}
          >
            <Text style={{ fontWeight: "600" }}>Add Group</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
