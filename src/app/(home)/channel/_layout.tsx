import { Stack } from "expo-router";

export default function ChannelStack() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="[cid]"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
    // <Stack />
  );
}
