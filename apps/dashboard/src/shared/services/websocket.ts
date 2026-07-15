import { QueryClient } from '@tanstack/react-query';

let ws: WebSocket | null = null;
let reconnectTimeout: any = null;
let heartbeatInterval: any = null;
let currentQueryClient: QueryClient | null = null;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

export function initWebSocket(queryClient: QueryClient) {
  const isMock = import.meta.env.VITE_MOCK_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === 'true';
  if (isMock) {
    console.log('Skipping WebSocket connection in Demo Mode.');
    return;
  }
  currentQueryClient = queryClient;
  connect();
}


function connect() {
  if (ws) {
    try {
      ws.close();
    } catch (e) {
      // Ignored close exceptions
    }
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected to Gateway.');
    startHeartbeat();
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log('WebSocket event received:', msg);
      
      if (!currentQueryClient) return;

      // React Query invalidations based on WebSocket notifications type
      if (msg.type === 'METRICS_UPDATE') {
        currentQueryClient.invalidateQueries({ queryKey: ['sessions'] });
        currentQueryClient.invalidateQueries({ queryKey: ['activity'] });
        currentQueryClient.invalidateQueries({ queryKey: ['health'] });
      } else if (msg.type === 'RECOMMENDATIONS_UPDATE') {
        currentQueryClient.invalidateQueries({ queryKey: ['recommendations'] });
      } else if (msg.type === 'HEALTH_ALERT') {
        currentQueryClient.invalidateQueries({ queryKey: ['health'] });
      }
    } catch (e) {
      console.error('Error parsing WebSocket event payload:', e);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket closed. Scheduled reconnect backoff...');
    stopHeartbeat();
    scheduleReconnect();
  };

  ws.onerror = (err) => {
    console.error('WebSocket connection failure:', err);
  };
}

function scheduleReconnect() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    console.log('Executing WebSocket auto-reconnect...');
    connect();
  }, 5000); // 5s backoff
}

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'PING' }));
    }
  }, 30000); // 30s heartbeat ping
}

function stopHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
}
