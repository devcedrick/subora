import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-7xl font-sans-extrabold text-primary">Home</Text>
      <Link
        href="/(auth)/sign-in"
        className="bg-primary text-white text-l font-sans-bold p-3 rounded-md mt-5"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="bg-primary text-white text-l font-sans-bold p-3 rounded-md mt-4"
      >
        Sign Up
      </Link>

      {/* Subscription Examples */}
      <Link
        href={{ pathname: "/subscriptions/[id]", params: { id: "claude-ai" } }}
        className="bg-primary text-white text-l font-sans-bold p-3 rounded-md mt-30"
      >
        Claude Max Subscription
      </Link>
    </SafeAreaView>
  );
}
