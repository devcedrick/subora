import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSubscriptions = HOME_SUBSCRIPTIONS.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePress = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView className="flex-1 bg-background">
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredSubscriptions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 125, gap: 15 }}
            ListHeaderComponent={
              <View className="pb-2">
                <Text className="list-title mb-4 text-xl">Subscriptions</Text>
                <View className="flex-row items-center rounded-2xl border border-border bg-card px-5 py-1">
                  <TextInput
                    className="flex-1 text-base font-sans-medium text-primary h-full"
                    placeholder="Search subscriptions..."
                    placeholderTextColor="rgba(0, 0, 0, 0.6)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <SubscriptionCard
                name={item.name}
                price={item.price}
                currency={item.currency}
                icon={item.icon}
                billing={item.billing}
                color={item.color}
                category={item.category}
                plan={item.plan}
                paymentMethod={item.paymentMethod}
                renewalDate={item.renewalDate}
                startDate={item.startDate}
                status={item.status}
                expanded={expandedId === item.id}
                onPress={() => {
                  Keyboard.dismiss();
                  handlePress(item.id);
                }}
              />
            )}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Text className="font-sans-medium text-muted-foreground text-base">
                  No subscriptions found
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Subscriptions;
