import { useState, useEffect, useMemo } from "react";

export type RecipeState = {
  recipes: string;
};

function createWebsocketConnection(endpoint: string): WebSocket {
  const socket = new WebSocket(endpoint, ["websocket"]);
  return socket;
}

export function useSocket({ endpoint }: { endpoint: string }) {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useMemo(() => createWebsocketConnection(endpoint), [endpoint]);

  socket.onerror = (error) => {
    setIsConnected(false);
    console.log(error);
  };

  useEffect(() => {
    socket.onopen = (event) => {
      setIsConnected(true);
      console.log(event);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
  };
}
