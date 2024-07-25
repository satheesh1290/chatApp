// src/shared/API/generateStreamToken.js

import { apolloClient } from "../providers/apollo";
import { GENERATE_STREAM_TOKEN_MUTATION } from "../shared/API/stream_token";

export const generateStreamToken = async (userId) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: GENERATE_STREAM_TOKEN_MUTATION,
      variables: { userId },
    });
    return data.generateStreamToken.token;
  } catch (error) {
    console.error("Error generating stream token:", error);
    throw new Error("Failed to generate stream token");
  }
};
