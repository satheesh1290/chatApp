import React, { createContext, useState, useContext, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApolloClient } from "@apollo/client";
// import { apolloClient } from "./apollo";
import { router } from "expo-router";

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  login: (userData: User, token: string, userToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => {},
  logout: async () => {},
  loadUser: async () => {},
  updateUser: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const client = useApolloClient();

  const loadUser = async () => {
    try {
      let token, userData;
      if (Platform.OS === "web") {
        token = localStorage.getItem("token");
        userData = localStorage.getItem("user");
      } else {
        token = await AsyncStorage.getItem("token");
        userData = await AsyncStorage.getItem("user");
      }
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
      console.log("Loaded user:", user); // Debugging: Ensure user is set correctly
    } catch (error) {
      console.error("Failed to load user", error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (userData: User, token: string, userToken: string) => {
    setUser(userData);
    if (Platform.OS === "web") {
      localStorage.setItem("token", token);
      localStorage.setItem("userToken", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userToken", userToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = async () => {
    setUser(null);
    if (Platform.OS === "web") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userToken");
    } else {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userToken");
    }
    await client.resetStore();
    console.log("logout successfully", user.email);
    router.replace("/login");
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (user) {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);

      if (Platform.OS === "web") {
        localStorage.setItem("user", JSON.stringify(newUserData));
      } else {
        await AsyncStorage.setItem("user", JSON.stringify(newUserData));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProvider;
