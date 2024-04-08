"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        placeholder="Digite os ingredientes separados por vírgula"
        className={cn(
          "overflow-hidden font-medium bg-transparent text-slate-600 placeholder:font-medium placeholder:text-slate-500 p-2 h-10 px-2 w-full focus-visible:outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

export type PromptChatInputProps = {
  onMessageSend: (content: string) => void;
};

const PromptChatInput: React.FC<PromptChatInputProps> = ({ onMessageSend }) => {
  const [message, setMessage] = React.useState("");
  const [prevMessage, setPrevMessage] = React.useState("");

  const clearInput = () => {
    setMessage("");
  };

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const sendMessage = () => {
    if (message === "") return;
    if (message === prevMessage) return;
    clearInput();
    setPrevMessage(message);
    onMessageSend(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isFocused) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <TextArea
        ref={textAreaRef}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className=""
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />
      <Button
        onClick={(e) => {
          sendMessage();
        }}
        variant={"ghost"}
        className="ml-2"
      >
        <SendIcon className="w-5 text-slate-400" />{" "}
      </Button>
    </>
  );
};

export default PromptChatInput;
