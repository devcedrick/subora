import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="items-center justify-center flex-1">
      <Text>Subscription Details: {id}</Text>
      <Link className="p-3 bg-accent text-xl rounded-md mt-3" href="../">
        {" "}
        Go Back{" "}
      </Link>
    </View>
  );
};

export default SubscriptionDetails;
