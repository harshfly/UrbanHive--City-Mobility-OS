import { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';

export function useUrbanHiveSocket() {
  const [data, setData] = useState(mockData);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // We attempt to connect to socket, but since backend might be offline,
    // we use mockData until a successful connection.
    let ws;
    let reconnectTimer;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
          setConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.event === 'live_data') {
              setData(parsed.payload);
            } else if (parsed.event === 'alert') {
              setAlerts(prev => {
                const newAlerts = [parsed.payload, ...prev].slice(0, 5);
                return newAlerts;
              });
            }
          } catch (e) {
            console.error("Error parsing websocket message", e);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // Auto reconnect
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = (e) => {
          // Silent error for demo fallback
        };
      } catch (e) {
        // Fallback
      }
    };

    connect();

    // Trigger an initial alert simulation to show the functionality
    setTimeout(() => {
      if (!connected) {
        setAlerts(prev => [{
          id: Date.now(),
          type: "system",
          message: "Using mock offline data",
          severity: "warning"
        }, ...prev]);
      }
    }, 2000);

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  return { data, connected, alerts };
}
