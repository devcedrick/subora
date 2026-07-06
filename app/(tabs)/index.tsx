import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
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
        href="/subscriptions/claude-ai"
        className="bg-accent text-white text-xl p-3 rounded-md m-5"
      >
        Claude Max Subscription
      </Link>
    </View>
  );
}
