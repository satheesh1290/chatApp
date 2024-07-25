// src/screens/SignIn.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useMutation } from "@apollo/client";
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
} from "../../shared/API/login_mutation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../providers/AuthProvider";
import { router } from "expo-router";

const setToken = async (token: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem("token");
    localStorage.setItem("token", token);
  } else {
    try {
      console.log(token);
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error setting token in AsyncStorage:", error);
    }
  }
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login: authLogin } = useAuth();

  const [login, { loading: loginLoading, error: loginError }] = useMutation(
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        authLogin(data.login.user, data.login.token);
        router.replace("/(home)");
      },
    }
  );

  const [signup, { loading: signupLoading, error: signupError }] = useMutation(
    SIGNUP_MUTATION,
    {
      onCompleted: (data) => {
        authLogin(data.signup.user, data.signup.token);
        router.replace("/(home)");
      },
    }
  );

  const handleSignIn = async () => {
    try {
      const result = await login({
        variables: {
          email: email,
          password: password,
        },
      });
      console.log("login result data=>", result.data);
      await setToken(result.data.login.token);
      setEmail("");
      setPassword("");
    } catch (e) {
      console.error("Login error:", e);
    }
  };

  const handleSignUp = async () => {
    try {
      const result = await signup({
        variables: {
          email: email,
          password: password,
          username: email,
        },
      });
      console.log(result.data);
      await setToken(result.data.signup.token);
      setEmail("");
      setPassword("");
    } catch (e) {
      console.error("Signup error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Sign Up" : "Sign In"}</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isSignUp ? (
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          disabled={signupLoading}
        />
      ) : (
        <Button
          title="Sign In"
          onPress={handleSignIn}
          disabled={loginLoading}
        />
      )}
      {loginError && <Text>{loginError.message}</Text>}
      {signupError && <Text>{signupError.message}</Text>}
      <Pressable onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchText}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  switchText: {
    marginTop: 16,
    color: "blue",
    textAlign: "center",
  },
});

export default SignIn;
