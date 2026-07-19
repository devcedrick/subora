import "@/global.css";
import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { StatusBar } from "react-native";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/config/posthog";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const { user } = useUser();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      const ALLOWED_SCREEN_PARAMS = new Set([
        "screen", "referrer", "source", "from", "tab", "section",
      ]);
      const safeParams: Record<string, string> = {};
      for (const key of Object.keys(params)) {
        if (ALLOWED_SCREEN_PARAMS.has(key)) {
          safeParams[key] = String(params[key]);
        }
      }
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...safeParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        $set: {
          email: user.primaryEmailAddress?.emailAddress,
        },
        $set_once: {
          first_seen_at: user.createdAt?.toISOString(),
        },
      });
    }
  }, [user]);

  return (
    <>
      <StatusBar translucent backgroundColor="#000000" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY – add it to your .env file",
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ["testID"],
        }}
      >
        <AppContent />
      </PostHogProvider>
    </ClerkProvider>
  );
}
