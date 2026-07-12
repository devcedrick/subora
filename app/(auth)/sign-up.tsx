import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";

const SafeAreaView = styled(RNSafeAreaView);

// ─── helpers ──────────────────────────────────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const MIN_PASSWORD_LENGTH = 8;

// ─── component ────────────────────────────────────────────────
export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // client-side validation state
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError =
    touched.email && !isValidEmail(emailAddress)
      ? "Enter a valid email address"
      : undefined;

  const passwordError =
    touched.password && password.length < MIN_PASSWORD_LENGTH
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      : undefined;

  const isBusy = fetchStatus === "fetching";
  const canSubmit =
    isValidEmail(emailAddress) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    !isBusy;

  // ── sign-up flow ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  // ── email verification flow ───────────────────────────────
  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as Href);
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  // ── done states ───────────────────────────────────────────
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // ── email verification screen ─────────────────────────────
  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (needsVerification) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Brand block ─────────────────────────── */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <Image
                  source={icons.logo}
                  className="size-14 rounded-2xl"
                  resizeMode="contain"
                />
                <View>
                  <Text className="auth-wordmark">Subora</Text>
                  <Text className="auth-wordmark-sub">
                    Smart Subscriptions
                  </Text>
                </View>
              </View>

              <Text className="auth-title">Verify your email</Text>
              <Text className="auth-subtitle">
                We sent a code to {emailAddress}
              </Text>
            </View>

            {/* ── Verification card ───────────────────── */}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${errors.fields.code ? "auth-input-error" : ""}`}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="number-pad"
                    autoFocus
                  />
                  {errors.fields.code && (
                    <Text className="auth-error">
                      {errors.fields.code.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!code || isBusy) ? "auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={!code || isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Main sign-up screen ───────────────────────────────────
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Brand block ─────────────────────────── */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <Image
                source={icons.logo}
                className="size-14 rounded-2xl"
                resizeMode="contain"
              />
              <View>
                <Text className="auth-wordmark">Subora</Text>
                <Text className="auth-wordmark-sub">Smart Subscriptions</Text>
              </View>
            </View>

            <Text className="auth-title">Create account</Text>
            <Text className="auth-subtitle">
              Start tracking your subscriptions
            </Text>
          </View>

          {/* ── Form card ─────────────────────────────── */}
          <View className="auth-card">
            <View className="auth-form">
              {/* Email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${emailError || errors.fields.emailAddress ? "auth-input-error" : ""}`}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                />
                {emailError && <Text className="auth-error">{emailError}</Text>}
                {errors.fields.emailAddress && (
                  <Text className="auth-error">
                    {errors.fields.emailAddress.message}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={`auth-input ${passwordError || errors.fields.password ? "auth-input-error" : ""}`}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  placeholder="Create a password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                />
                {!passwordError && (
                  <Text className="auth-helper">
                    Must be at least {MIN_PASSWORD_LENGTH} characters
                  </Text>
                )}
                {passwordError && (
                  <Text className="auth-error">{passwordError}</Text>
                )}
                {errors.fields.password && (
                  <Text className="auth-error">
                    {errors.fields.password.message}
                  </Text>
                )}
              </View>

              {/* Global / non-field errors */}
              {errors.global && (
                <Text className="auth-error">{errors.global.message}</Text>
              )}

              {/* Submit button */}
              <Pressable
                className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {isBusy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>
            </View>

            {/* ── Footer link ─────────────────────────── */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Required for Clerk bot protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
