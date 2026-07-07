import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/(auth)/sign-in"
        className="bg-accent text-white text-xl p-3 rounded-md m-5"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="bg-accent text-white text-xl p-3 rounded-md m-5"
      >
        Sign Up
      </Link>

      {/* Subscription Examples */}
      <Link
        href={{ pathname: "/subscriptions/[id]", params: { id: "claude-ai" } }}
        className="bg-accent text-white text-xl p-3 rounded-md m-5"
      >
        Claude Max Subscription
      </Link>
    </SafeAreaView>
  );
}
