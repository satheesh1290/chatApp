import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ChannelMemberResponse } from "stream-chat";

export default function MembersScreen() {
  const { cid, members } = useLocalSearchParams<{
    cid: string;
    members: string;
  }>();
  const [parsedMembers, setParsedMembers] = useState<ChannelMemberResponse[]>(
    []
  );

  useEffect(() => {
    if (members) {
      setParsedMembers(JSON.parse(members));
    }
  }, [members]);

  if (!parsedMembers.length) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Channel Members
      </Text>
      <FlatList
        data={parsedMembers}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.user.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
