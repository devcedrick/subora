import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar translucent backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
