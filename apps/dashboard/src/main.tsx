import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { initWebSocket } from './shared/services/websocket';
import './index.css';

// Configure query caching defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30s fresh stale limits
      gcTime: 300000,   // 5m garbage caching time
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Initialize WebSocket kept-alive updates syncing
initWebSocket(queryClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
