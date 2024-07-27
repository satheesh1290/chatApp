import React from "react";
import { Platform } from "react-native";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApolloClientDevTools } from "@dev-plugins/apollo-client";

const getUri = () => {
  // For Android emulator
  if (Platform.OS === "android") {
    return "http://192.168.31.42:8000/graphql/";
  }
  // For iOS emulator or other environments
  return "http://localhost:8000/graphql/";
};

const httpLink = createHttpLink({
  uri: getUri(),
});

const getToken = async () => {
  if (Platform.OS === "web") {
    const token = localStorage.getItem("token");
    const userToken = localStorage.getItem("userToken");
    return { token, userToken };
  } else {
    const token = await AsyncStorage.getItem("token");
    const userToken = await AsyncStorage.getItem("userToken");
    return { token, userToken };
  }
};

const authLink = setContext(async (_, { headers }) => {
  try {
    const { token } = await getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "", // Use Bearer instead of JWT
      },
    };
  } catch (error) {
    console.error("Error setting auth header:", error);
    return {
      headers,
    };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useApolloClientDevTools(client);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
export { client as apolloClient, getToken };
