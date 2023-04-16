import { QueryClient } from '@tanstack/react-query';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 60 * 60 * 1000, // 1hr
      staleTime: 15 * 60 * 1000, // 15m
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  },
});

export default client;
