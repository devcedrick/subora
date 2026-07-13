import "@/global.css";
import { useAuth, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import React from "react";
import { usePostHog } from "posthog-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const InfoRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string | undefined | null;
  isLast?: boolean;
}) => (
  <View className={`py-4 ${!isLast ? "border-b border-border" : ""}`}>
    <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">
      {label}
    </Text>
    <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
      {value ?? "—"}
    </Text>
  </View>
);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const posthog = usePostHog();

  const handleSignOut = async () => {
    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
    } catch (e) {
      console.error(e);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow px-5 pt-6 pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-3xl font-sans-extrabold text-primary mb-8">
          Settings
        </Text>

        {/* Profile Header section */}
        <View className="items-center mb-8">
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-24 h-24 rounded-full mb-4 border-4 border-card"
          />
          <Text className="text-2xl font-sans-bold text-primary">
            {user?.firstName ?? user?.username ?? "User"}
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
            {user?.primaryEmailAddress?.emailAddress ?? "No email"}
          </Text>
        </View>

        {/* Account Details Card */}
        <View className="rounded-3xl border border-border bg-card p-5 mb-8 shadow-sm">
          <Text className="text-xl font-sans-extrabold text-primary mb-2">
            Account Details
          </Text>

          <InfoRow label="Account ID" value={user?.id} />
          <InfoRow label="Member since" value={joinedDate} isLast={true} />
        </View>

        {/* Log Out Button */}
        <View className="items-center mt-2">
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-full items-center rounded-2xl border border-destructive/30 bg-destructive/10 py-4"
            activeOpacity={0.7}
          >
            <Text className="text-base font-sans-extrabold text-destructive">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
