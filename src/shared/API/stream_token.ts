// src/shared/API/streamTokenMutation.js

import { gql } from "@apollo/client";

export const GENERATE_STREAM_TOKEN_MUTATION = gql`
  mutation GenerateStreamToken($userId: ID!) {
    generateStreamToken(userId: $userId) {
      token
    }
  }
`;
