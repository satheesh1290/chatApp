import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import { Button, Input } from "@rneui/themed";
import { useAuth } from "../../../providers/AuthProvider";
import Avatar from "../../../components/Avatar";
import { useMutation, useQuery } from "@apollo/client";
import { GET_PROFILE, UPDATE_PROFILE } from "../../../shared/API/profile_fetch";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data, refetch } = useQuery(GET_PROFILE);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  useEffect(() => {
    console.log(data);
    if (data?.me) {
      setUsername(data.me.username);
      setFirstName(data.me.firstName);
      setLastName(data.me.lastName);
      setAvatarUrl(data.me.avatarUrl);
    }
  }, [data]);

  async function handleUpdateProfile() {
    try {
      setLoading(true);
      const { data } = await updateProfile({
        variables: { username, firstName, lastName },
      });
      if (data.updateProfile.user) {
        Alert.alert("Success", "Profile updated successfully");
        refetch();
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

  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            refetch();
          }}
        />
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
