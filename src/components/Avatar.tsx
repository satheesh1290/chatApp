import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Image, Button } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation, gql } from "@apollo/client";
import { Platform } from "react-native";

const getUri = () => {
  // For Android emulator
  if (Platform.OS === "android") {
    return "http://192.168.31.42:8000/graphql/";
  }
  // For iOS emulator or other environments
  return "http://localhost:8000/graphql/";
};

const GRAPHQL_SERVER_URL = getUri();

const UPLOAD_AVATAR_MUTATION = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file) {
      success
      avatarUrl
    }
  }
`;

interface Props {
  size: number;
  url: string | null;
  onUpload: (url: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  const [uploadAvatarMutation] = useMutation(UPLOAD_AVATAR_MUTATION);

  useEffect(() => {
    if (url) setAvatarUrl(url);
  }, [url]);

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];
      console.log("Got image", image);

      if (!image.uri) {
        throw new Error("No image uri!");
      }

      // Create a File object from the image URI
      const response = await fetch(image.uri);
      const blob = await response.blob();
      //   const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      // Upload the file using the GraphQL mutation
      const { data } = await uploadAvatarMutation({
        variables: { file: blob },
        // context: {
        //   // This is important for file uploads
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // },
      });

      const file = new File([blob], "avatar.jpg", { type: blob.type });

      if (data.uploadAvatar.success) {
        setAvatarUrl(data.uploadAvatar.avatarUrl);
        onUpload(data.uploadAvatar.avatarUrl);
      } else {
        throw new Error("Failed to upload avatar");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      <View>
        <Button
          title={uploading ? "Uploading ..." : "Upload"}
          onPress={uploadAvatar}
          disabled={uploading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5,
    overflow: "hidden",
    maxWidth: "100%",
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgb(200, 200, 200)",
    borderRadius: 5,
  },
});
