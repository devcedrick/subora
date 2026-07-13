import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
  subscribeToSubscriptions,
} from "@/constants/data";
import icons from "@/constants/icons";
import "@/global.css";
import { formatCurrency } from "@/lib/utils/currency";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState, useEffect } from "react";
import { usePostHog } from "posthog-react-native";
import { FlatList, Image, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const router = useRouter();
  const { user } = useUser();
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [subscriptions, setSubscriptions] = useState(HOME_SUBSCRIPTIONS);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    return subscribeToSubscriptions(() => {
      setSubscriptions([...HOME_SUBSCRIPTIONS]);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={{ uri: user?.imageUrl }}
                  className="home-avatar"
                />
                <Text className="home-user-name">
                  {user?.firstName ?? user?.username ?? "User"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </TouchableOpacity>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading
                title="Upcoming"
                onPress={() => router.push("/(tabs)/subscriptions")}
              />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming subscriptions yet.
                  </Text>
                }
              />
            </View>

            <ListHeading
              title="All Subscriptions"
              onPress={() => router.push("/(tabs)/subscriptions")}
            />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              setExpandedSubscriptionId((currentId) => {
                const isExpanding = currentId !== item.id;
                if (isExpanding) {
                  posthog.capture("subscription_card_expanded", {
                    subscription_id: item.id,
                  });
                }
                return isExpanding ? item.id : null;
              });
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-28"
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
