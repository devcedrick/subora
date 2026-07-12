import { useSignIn } from "@clerk/expo";
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
export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  // Basic sign in state
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // Forgot password state
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"none" | "email" | "code" | "new_password">("none");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // client-side validation state
  const [touched, setTouched] = useState({ email: false, password: false, newPassword: false });

  const emailError =
    touched.email && !isValidEmail(emailAddress)
      ? "Enter a valid email address"
      : undefined;

  const passwordError =
    touched.password && password.length === 0
      ? "Password is required"
      : undefined;

  const newPasswordError =
    touched.newPassword && newPassword.length < MIN_PASSWORD_LENGTH
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      : undefined;

  const isBusy = fetchStatus === "fetching";
  const canSubmit =
    isValidEmail(emailAddress) && password.length > 0 && !isBusy;

  const canSubmitEmail = isValidEmail(emailAddress) && !isBusy;
  const canSubmitResetCode = resetCode.length > 0 && !isBusy;
  const canSubmitNewPassword = newPassword.length >= MIN_PASSWORD_LENGTH && !isBusy;

  // ── sign-in flow ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as Href);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      // MFA – handled separately
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  // ── MFA verify flow ───────────────────────────────────────
  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
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
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  // ── Forgot Password Flow ──────────────────────────────────
  
  // Step 1: Send reset code
  const handleSendResetCode = async () => {
    if (!canSubmitEmail) return;

    const { error: createError } = await signIn.create({
      identifier: emailAddress,
    });
    
    if (createError) {
      console.error(JSON.stringify(createError, null, 2));
      return;
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();
    
    if (sendCodeError) {
      console.error(JSON.stringify(sendCodeError, null, 2));
      return;
    }

    setForgotPasswordStep("code");
  };

  // Step 2: Verify reset code
  const handleVerifyResetCode = async () => {
    if (!canSubmitResetCode) return;
    
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: resetCode,
    });
    
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    
    setForgotPasswordStep("new_password");
  };

  // Step 3: Submit new password
  const handleSubmitNewPassword = async () => {
    if (!canSubmitNewPassword) return;
    
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === 'complete') {
      const { error: finalizeError } = await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }
          const url = decorateUrl('/');
          router.push(url as Href);
        },
      });

      if (finalizeError) {
        console.error(JSON.stringify(finalizeError, null, 2));
        return;
      }
    } else {
      console.error('Sign-in attempt not complete:', signIn);
    }
  };

  // ── Render Helpers ────────────────────────────────────────

  const renderBrandBlock = (title: string, subtitle: string) => (
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

      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );

  const LayoutWrap = ({ children }: { children: React.ReactNode }) => (
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
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ── MFA / client-trust verification screen ────────────────
  if (signIn.status === "needs_client_trust") {
    return (
      <LayoutWrap>
        {renderBrandBlock("Verify your account", "We sent a verification code to your email")}
        
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Verification code</Text>
              <TextInput
                className={`auth-input ${errors.fields.code ? "auth-input-error" : ""}`}
                value={code}
                onChangeText={setCode}
                placeholder="Enter code"
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
              onPress={() => signIn.mfa.sendEmailCode()}
            >
              <Text className="auth-secondary-button-text">Resend code</Text>
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              onPress={() => signIn.reset()}
            >
              <Text className="auth-secondary-button-text">Start over</Text>
            </Pressable>
          </View>
        </View>
      </LayoutWrap>
    );
  }

  // ── Forgot Password: Set New Password ─────────────────────
  if (forgotPasswordStep === "new_password" || signIn.status === "needs_new_password") {
    return (
      <LayoutWrap>
        {renderBrandBlock("Set new password", "Create a new password for your account")}
        
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">New Password</Text>
              <TextInput
                className={`auth-input ${newPasswordError || errors.fields.password ? "auth-input-error" : ""}`}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                onBlur={() => setTouched((prev) => ({ ...prev, newPassword: true }))}
                placeholder="Enter new password"
                placeholderTextColor="rgba(0,0,0,0.35)"
              />
              {!newPasswordError && (
                <Text className="auth-helper">
                  Must be at least {MIN_PASSWORD_LENGTH} characters
                </Text>
              )}
              {newPasswordError && (
                <Text className="auth-error">{newPasswordError}</Text>
              )}
              {errors.fields.password && (
                <Text className="auth-error">
                  {errors.fields.password.message}
                </Text>
              )}
            </View>

            {errors.global && (
              <Text className="auth-error">{errors.global.message}</Text>
            )}

            <Pressable
              className={`auth-button ${!canSubmitNewPassword ? "auth-button-disabled" : ""}`}
              onPress={handleSubmitNewPassword}
              disabled={!canSubmitNewPassword}
            >
              {isBusy ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Set password</Text>
              )}
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              onPress={() => setForgotPasswordStep("none")}
            >
              <Text className="auth-secondary-button-text">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </LayoutWrap>
    );
  }

  // ── Forgot Password: Verify Code ──────────────────────────
  if (forgotPasswordStep === "code") {
    return (
      <LayoutWrap>
        {renderBrandBlock("Verify code", `Enter the reset code sent to ${emailAddress}`)}
        
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Verification code</Text>
              <TextInput
                className={`auth-input ${errors.fields.code ? "auth-input-error" : ""}`}
                value={resetCode}
                onChangeText={setResetCode}
                placeholder="Enter verification code"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="numeric"
                autoFocus
              />
              {errors.fields.code && (
                <Text className="auth-error">
                  {errors.fields.code.message}
                </Text>
              )}
            </View>

            {errors.global && (
              <Text className="auth-error">{errors.global.message}</Text>
            )}

            <Pressable
              className={`auth-button ${(!resetCode || isBusy) ? "auth-button-disabled" : ""}`}
              onPress={handleVerifyResetCode}
              disabled={!resetCode || isBusy}
            >
              {isBusy ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Verify code</Text>
              )}
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              onPress={() => setForgotPasswordStep("none")}
            >
              <Text className="auth-secondary-button-text">Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </LayoutWrap>
    );
  }

  // ── Forgot Password: Email Entry ──────────────────────────
  if (forgotPasswordStep === "email") {
    return (
      <LayoutWrap>
        {renderBrandBlock("Reset Password", "Enter your email to receive a reset code")}
        
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Email</Text>
              <TextInput
                className={`auth-input ${emailError || errors.fields.identifier ? "auth-input-error" : ""}`}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={emailAddress}
                onChangeText={setEmailAddress}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="Enter your email"
                placeholderTextColor="rgba(0,0,0,0.35)"
              />
              {emailError && <Text className="auth-error">{emailError}</Text>}
              {errors.fields.identifier && (
                <Text className="auth-error">
                  {errors.fields.identifier.message}
                </Text>
              )}
            </View>

            {errors.global && (
              <Text className="auth-error">{errors.global.message}</Text>
            )}

            <Pressable
              className={`auth-button ${!canSubmitEmail ? "auth-button-disabled" : ""}`}
              onPress={handleSendResetCode}
              disabled={!canSubmitEmail}
            >
              {isBusy ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Send reset code</Text>
              )}
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              onPress={() => setForgotPasswordStep("none")}
            >
              <Text className="auth-secondary-button-text">Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </LayoutWrap>
    );
  }

  // ── Main sign-in screen ───────────────────────────────────
  return (
    <LayoutWrap>
      {renderBrandBlock("Welcome back", "Sign in to manage your subscriptions")}

      {/* ── Form card ─────────────────────────────── */}
      <View className="auth-card">
        <View className="auth-form">
          {/* Email */}
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={`auth-input ${emailError || errors.fields.identifier ? "auth-input-error" : ""}`}
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
            {errors.fields.identifier && (
              <Text className="auth-error">
                {errors.fields.identifier.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="auth-field">
            <View className="flex-row items-center justify-between">
              <Text className="auth-label">Password</Text>
              <Pressable onPress={() => setForgotPasswordStep("email")}>
                <Text className="text-sm font-sans-semibold text-accent">Forgot?</Text>
              </Pressable>
            </View>
            <TextInput
              className={`auth-input ${passwordError || errors.fields.password ? "auth-input-error" : ""}`}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, password: true }))
              }
              placeholder="Enter your password"
              placeholderTextColor="rgba(0,0,0,0.35)"
            />
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
              <Text className="auth-button-text">Sign in</Text>
            )}
          </Pressable>
        </View>

        {/* ── Footer link ─────────────────────────── */}
        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Subora? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="auth-link">Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </LayoutWrap>
  );
}
