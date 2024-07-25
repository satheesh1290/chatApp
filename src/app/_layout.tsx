import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "../providers/AuthProvider";
import AppProvider from "../providers/apollo";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
