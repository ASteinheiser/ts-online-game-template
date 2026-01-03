import { useEffect, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import type { Auth_GetHealthCheckQuery } from '../graphql';

const MAX_RETRIES = 10;
const RETRY_DELAY = 500;

const GET_HEALTH_CHECK = gql`
  query Auth_GetHealthCheck {
    healthCheck
  }
`;

interface UseHealthCheckProps {
  enabled: boolean;
}

interface UseHealthCheckResult {
  isHealthy: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useHealthCheck = ({ enabled }: UseHealthCheckProps): UseHealthCheckResult => {
  const client = useApolloClient();
  const retries = useRef(0);
  const checkInProgress = useRef(false);

  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (enabled) handleHealthCheck();
  }, [enabled]);

  const handleHealthCheck = async () => {
    if (checkInProgress.current) return;

    checkInProgress.current = true;
    retries.current = 0;
    setLoading(true);
    await checkHealth();
  };

  const checkHealth = async () => {
    if (retries.current >= MAX_RETRIES) {
      checkInProgress.current = false;
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await client.query<Auth_GetHealthCheckQuery>({
        query: GET_HEALTH_CHECK,
        fetchPolicy: 'network-only',
      });
      if (error) throw error;
      setIsHealthy(data?.healthCheck ?? false);
      setLoading(false);
    } catch {
      retries.current++;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      await checkHealth();
    }
  };

  return {
    isHealthy,
    loading,
    refetch: handleHealthCheck,
  };
};
