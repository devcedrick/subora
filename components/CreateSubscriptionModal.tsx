import { addSubscription } from "@/constants/data";
import icons from "@/constants/icons";
import { posthog } from "@/lib/config/posthog";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PASTEL_COLORS = [
  "#f5c542",
  "#e8def8",
  "#b8d4e3",
  "#b8e8d0",
  "#ffb3ba",
  "#ffdfba",
  "#ffffba",
  "#baffc9",
  "#bae1ff",
];
const CATEGORIES = [
  "AI Tools",
  "Design",
  "Developer Tools",
  "Entertainment",
  "Productivity",
  "Finance",
  "Other",
];

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [category, setCategory] = useState("AI Tools");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("AI Tools");
    setIsCategoryDropdownOpen(false);
    setError("");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter a provider name");
      return;
    }
    const numericPrice = Number(price);
    if (!price.trim() || isNaN(numericPrice) || numericPrice <= 0 || !isFinite(numericPrice)) {
      setError("Please enter a valid price");
      return;
    }

    const randomColor =
      PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];

    const newSub: any = {
      id: Math.random().toString(36).substring(7),
      icon: icons.wallet, // Fallback icon
      name: name.trim(),
      plan: `${frequency} Plan`,
      category: category,
      paymentMethod: "Added manually",
      status: "active",
      startDate: dayjs().toISOString(),
      price: Number(price),
      currency: "PHP",
      billing: frequency,
      renewalDate:
        frequency === "Monthly"
          ? dayjs().add(1, "month").toISOString()
          : dayjs().add(1, "year").toISOString(),
      color: randomColor,
    };

    addSubscription(newSub);
    posthog.capture("subscription_created", {
      provider_name: newSub.name,
      price: newSub.price,
      currency: newSub.currency,
      frequency: newSub.billing,
      category: newSub.category,
    });
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        className="modal-overlay"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <TouchableOpacity onPress={handleClose} className="modal-close">
              <Text className="modal-close-text">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="modal-body"
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          >
            {/* Form Field: Name */}
            <View className="auth-field">
              <Text className="auth-label">Provider Name</Text>
              <View
                className={`flex-row items-center rounded-2xl border bg-background px-4 py-1 ${error && !name.trim() ? "border-destructive" : "border-border"}`}
              >
                <TextInput
                  className="flex-1 py-3 text-base font-sans-medium text-primary"
                  placeholder="e.g. Netflix, Adobe"
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    setError("");
                  }}
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                />
              </View>
            </View>

            {/* Form Field: Price */}
            <View className="auth-field mt-4">
              <Text className="auth-label">Price (PHP)</Text>
              <View
                className={`flex-row items-center rounded-2xl border bg-background px-4 py-1 ${error && (!price.trim() || isNaN(Number(price))) ? "border-destructive" : "border-border"}`}
              >
                <TextInput
                  className="flex-1 py-3 text-base font-sans-medium text-primary"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(t) => {
                    setPrice(t);
                    setError("");
                  }}
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                />
              </View>
            </View>

            {/* Form Field: Frequency */}
            <View className="auth-field mt-4">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {["Monthly", "Yearly"].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    className={`picker-option ${
                      frequency === freq ? "picker-option-active" : ""
                    }`}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text
                      className={`picker-option-text ${
                        frequency === freq ? "picker-option-text-active" : ""
                      }`}
                    >
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Form Field: Category */}
            <View className="auth-field mt-4">
              <Text className="auth-label">Category</Text>
              <TouchableOpacity
                className="rounded-2xl border border-border bg-background px-4 py-4 flex-row justify-between items-center"
                onPress={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
              >
                <Text className="text-base font-sans-medium text-primary">
                  {category}
                </Text>
                <Text className="text-muted-foreground opacity-60">▼</Text>
              </TouchableOpacity>
              {isCategoryDropdownOpen && (
                <View className="mt-2 rounded-2xl border border-border bg-background overflow-hidden max-h-40">
                  <ScrollView nestedScrollEnabled className="p-2">
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        className={`px-4 py-3.5 mb-1 rounded-xl flex-row items-center justify-between ${
                          category === cat ? "bg-accent/10" : ""
                        }`}
                        onPress={() => {
                          setCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        <Text
                          className={`text-sm font-sans-semibold ${category === cat ? "text-accent" : "text-primary"}`}
                        >
                          {cat}
                        </Text>
                        {category === cat && (
                          <Text className="text-accent text-sm font-sans-bold">
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="mt-auto pt-10">
              {error ? <Text className="auth-error mb-4">{error}</Text> : null}
              <Pressable className="auth-button" onPress={handleSubmit}>
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
