import { Text, Pressable } from "react-native";
import React from "react";

const UserListItem = ({ user, isSelected, onSelect }) => (
  <Pressable
    onPress={onSelect}
    style={{
      padding: 15,
      backgroundColor: isSelected ? "#d3f4ff" : "white",
      borderBottomColor: "#ccc",
      borderBottomWidth: 1,
    }}
  >
    <Text style={{ fontWeight: "600" }}>
      {user.firstName + " " + user.lastName}
    </Text>
  </Pressable>
);

export default UserListItem;
