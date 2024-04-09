/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PromptChatBubbleList from "./PromptChatBubbleList";
import PromptChatInput from "./PromptChatInput";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

const PromptChatApp = () => {
  const [recipe, setRecipe] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { socket, isConnected } = useSocket({
    endpoint: `ws://localhost:1500/`,
  });

  const handleMessageSend = (content: string) => {
    setLoading(true);
    socket?.send(
      JSON.stringify({ type: "publish", message: content, channel: "chat" })
    );
  };

  const appendText = (newRecipe: string) => {
    setRecipe((prevRecipe: string) => prevRecipe + `${newRecipe}`);
  };

  socket.onmessage = async (event) => {
    setLoading(false);

    const reader = new FileReader();

    if (event.data instanceof Blob) {
      reader.readAsText(event.data);
    }

    reader.onload = (event) => {
      const newRecipe = event.target?.result as string;
      appendText(newRecipe.replace(/\n/g, "<br />"));
    };
  };

  return (
    <>
      <PromptChatBubbleList recipe={recipe} loading={loading} />
      <div className="fixed bottom-0 p-10 left-0 right-0 z-50 bg-white">
        <div className="grid grid-cols-12">
          <div className="col-span-6">
            <div
              className={cn(
                "flex bg-white shadow-md rounded-lg items-center relative border border-slate-400",
                isConnected ? "" : "border-red-500"
              )}
            >
              <PromptChatInput onMessageSend={handleMessageSend} />
            </div>
            <div className="text-center text-xs mt-4">
              Shift + Enter para adicionar uma nova linha
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromptChatApp;
