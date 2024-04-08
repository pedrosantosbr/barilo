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
    endpoint: `ws://localhost:3000/`,
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
      <div className="fixed bottom-0 p-10 left-0 right-0 z-50 bg-slate-50">
        <div className="grid grid-cols-12">
          <div className="col-span-6">
            <div
              className={cn(
                "flex bg-white rounded-lg items-center relative border-2",
                isConnected ? "" : "border-red-500"
              )}
            >
              <PromptChatInput onMessageSend={handleMessageSend} />
            </div>
            <small>Shift + Enter para adicionar uma nova linha</small>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromptChatApp;
