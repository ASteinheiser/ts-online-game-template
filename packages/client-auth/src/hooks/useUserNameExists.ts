import { useEffect, useState } from 'react';
import { ApolloError, gql, useApolloClient } from '@apollo/client';
import { useDebounce } from '@repo/ui/hooks';
import type { Auth_GetUserExistsQuery, Auth_GetUserExistsQueryVariables } from '../graphql';

const GET_USER_NAME_EXISTS = gql`
  query Auth_GetUserExists($userName: String!) {
    userExists(userName: $userName)
  }
`;

interface UseUserNameExistsResult {
  userNameExists?: boolean;
  isTyping: boolean;
  loading: boolean;
  error?: ApolloError;
}

export const useUserNameExists = (userName: string): UseUserNameExistsResult => {
  const client = useApolloClient();

  const [userNameExists, setUserNameExists] = useState<boolean>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApolloError>();

  const debouncedUserName = useDebounce(userName, 500);

  const isTyping = userName !== debouncedUserName;

  useEffect(() => {
    if (debouncedUserName !== '') {
      checkUserNameExists();
    }
  }, [debouncedUserName]);

  const checkUserNameExists = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.query<Auth_GetUserExistsQuery, Auth_GetUserExistsQueryVariables>({
        query: GET_USER_NAME_EXISTS,
        variables: { userName: debouncedUserName },
        fetchPolicy: 'network-only',
      });

      setError(error);
      setUserNameExists(data?.userExists ?? undefined);
    } catch (error) {
      console.error(error);
      setError(error as ApolloError);
      setUserNameExists(undefined);
    } finally {
      setLoading(false);
    }
  };

  return { userNameExists, isTyping, loading, error };
};
