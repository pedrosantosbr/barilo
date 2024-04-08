import { useState, useEffect, useMemo } from "react";

export type RecipeState = {
  recipes: string;
};

export function useSocket({ endpoint }: { endpoint: string }) {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useMemo(
    () => new WebSocket(endpoint, ["websocket"]),
    [endpoint]
  );

  useEffect(() => {
    socket.onopen = (event) => {
      setIsConnected(true);
      console.log(event);
    };

    socket.onerror = (error) => {
      setIsConnected(false);
      console.log(error);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
  };
}
