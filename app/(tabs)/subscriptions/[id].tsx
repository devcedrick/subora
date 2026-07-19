import { Link, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView as RNSafeArea } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeArea);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", { subscription_id: id });
  }, [id, posthog]);
  return (
    <SafeAreaView className="items-center justify-center flex-1">
      <Text>Subscription Details: {id}</Text>
      <Link className="p-3 bg-accent text-xl rounded-md mt-3" href="../">
        {" "}
        Go Back{" "}
      </Link>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;
