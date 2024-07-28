import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Image, Button, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getToken } from "../providers/apollo"; // Adjust the path if needed
import * as FileSystem from "expo-file-system";

interface Props {
  size?: number;
  url: string | null;
  onUpload: (url: string) => void;
}

const getUri = () => {
  // For Android emulator
  if (Platform.OS === "android") {
    return "http://192.168.31.42:8000/users/upload-avatar/";
  }
  // For iOS emulator or other environments
  return "http://localhost:8000/users/upload-avatar/";
};

export default function Avatar({ url, size, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) setAvatarUrl(url);
  }, [url]);

  useEffect(() => {
    if (url) setAvatarUrl(url);
  }, [url]);

  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      // Get the file extension from the URI
      const uriParts = image.uri.split(".");
      const fileExtension = uriParts[uriParts.length - 1];

      // Generate a unique filename
      const fileName = `image_${Date.now()}.${fileExtension}`;

      const { userToken } = await getToken();

      // Prepare the upload options
      const uploadOptions: FileSystem.FileSystemUploadOptions = {
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file", // This should match what your server expects
        mimeType: `image/${fileExtension}`,
        headers: {
          Authorization: `Bearer ${userToken}`, // Replace with your actual token
        },
      };

      // Perform the upload
      const uploadResult = await FileSystem.uploadAsync(
        getUri(),
        image.uri,
        uploadOptions
      );

      console.log("Upload success:", uploadResult);
      const responseBody = JSON.parse(uploadResult.body);
      const newAvatarUrl = responseBody.avatarUrl;

      setAvatarUrl(newAvatarUrl);
      onUpload(newAvatarUrl); // Call the callback with the new URL
      return uploadResult;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const uploadAvatar = async () => {
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
    if (!image.uri) {
      throw new Error("No image uri!");
    }

    try {
      const uploadImgResult = await uploadImage(image);
      console.log("Upload completed:", uploadImgResult);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl.trim().replace(/\/$/, "") }}
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
