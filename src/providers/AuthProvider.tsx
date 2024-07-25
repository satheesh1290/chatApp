import React, { createContext, useState, useContext, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApolloClient } from "@apollo/client";
import { USER_QUERY } from "../shared/API/users_fetch";
import { router } from "expo-router";

type User = {
  id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const client = useApolloClient();

  useEffect(() => {
    const loadUser = async () => {
      let token, userData;
      if (Platform.OS === "web") {
        token = localStorage.getItem("token");
        userData = localStorage.getItem("user");
      } else {
        token = await AsyncStorage.getItem("token");
        userData = await AsyncStorage.getItem("user");
      }
      if (token) {
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      }
      console.log(user);
    };
    loadUser();
  }, []);

  const login = async (userData: User, token: string) => {
    setUser(userData);
    if (Platform.OS === "web") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = async () => {
    setUser(null);
    if (Platform.OS === "web") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    await client.resetStore();
    console.log("logout successfully", user.email);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProvider;
