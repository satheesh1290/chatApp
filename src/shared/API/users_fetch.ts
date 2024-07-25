import { gql } from "@apollo/client";

export const USER_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    allUsers {
      id
      username
      email
      firstName
      lastName
    }
  }
`;
