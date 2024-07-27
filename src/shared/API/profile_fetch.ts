import { gql } from "@apollo/client";

export const GET_PROFILE = gql`
  query GetProfile {
    me {
      id
      email
      username
      firstName
      lastName
      avatarUrl
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $username: String!
    $firstName: String!
    $lastName: String!
  ) {
    updateProfile(
      username: $username
      firstName: $firstName
      lastName: $lastName
    ) {
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
`;
