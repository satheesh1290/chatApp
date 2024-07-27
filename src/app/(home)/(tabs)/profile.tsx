import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import { Button, Input } from "@rneui/themed";
import { useAuth } from "../../../providers/AuthProvider";
import Avatar from "../../../components/Avatar";
import { useMutation } from "@apollo/client";
import { UPDATE_PROFILE } from "../../../shared/API/profile_fetch";

export default function ProfileScreen() {
  const { user, loadUser, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Debugging: Check if user data is available
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setUsername(user.username);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setAvatarUrl(user.avatarUrl);
      } else {
        await loadUser(); // Load user data if not already available
      }
    };
    fetchData();
    // console.log("User data:", user);
  }, [user, loadUser]);

  const [updateProfile] = useMutation(UPDATE_PROFILE);

  async function handleUpdateProfile() {
    if (!user) {
      Alert.alert("Error", "Not logged in");
      return;
    }
    try {
      setLoading(true);
      const updatedUserData = { username, firstName, lastName };
      const { data } = await updateProfile({
        variables: updatedUserData,
      });
      if (data.updateProfile.user) {
        await updateUser({ ...updatedUserData, avatarUrl });
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  const handleUpload = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    await updateUser({ avatarUrl: newUrl });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Avatar size={200} url={avatarUrl} onUpload={handleUpload} />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ""}
          onChangeText={setUsername}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="First Name"
          value={firstName || ""}
          onChangeText={setFirstName}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Last Name"
          value={lastName || ""}
          onChangeText={setLastName}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Loading ..." : "Update"}
          onPress={handleUpdateProfile}
          disabled={loading}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mb20]}>
        <Button title="Sign Out" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  mb20: {
    marginBottom: 20,
  },
});
