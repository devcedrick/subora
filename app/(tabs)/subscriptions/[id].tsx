import { Link, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView as RNSafeArea } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeArea);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
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
