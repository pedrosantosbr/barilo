/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import PromptChatBubbleList from "./PromptChatBubbleList";
import PromptChatInput from "./PromptChatInput";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";

const PromptChatApp = () => {
  const [recipe, setRecipe] = useState<string>("");
  const [recipeMarkdown, setRecipeMarkdown] = useState<string>("");
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
  const appendMarkdown = (markdown: string) => {
    setRecipeMarkdown((prevRecipe: string) => prevRecipe + `${markdown}`);
  };

  socket.onmessage = async (event) => {
    setLoading(false);

    const reader = new FileReader();

    if (event.data instanceof Blob) {
      reader.readAsText(event.data);
    }

    reader.onload = async (event) => {
      const newRecipe = event.target?.result as string;
      appendText(newRecipe);
    };
  };

  useEffect(() => {
    async function convertRecipeStringToMarkdown(recipe: string) {
      const matterResult = matter(recipe);
      const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
      const contentHtml = processedContent.toString();
      setRecipeMarkdown(contentHtml);
    }
    convertRecipeStringToMarkdown(recipe);
  }, [recipe]);

  return (
    <>
      <PromptChatBubbleList recipe={recipeMarkdown} loading={loading} />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white">
        <div className="grid grid-cols-12">
          <div className="col-span-3"></div>
          <div className="col-span-6">
            <div
              className={cn(
                "flex border-input bg-background shadow-sm rounded-xl items-center relative border px-2",
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
