import { QueryClient } from '@tanstack/react-query';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 1000,
      // cacheTime: 1000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  },
});

export default client;
