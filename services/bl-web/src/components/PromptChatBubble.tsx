import { Message } from "./Prompt.types";
import { Skeleton } from "@/components/ui/skeleton";

const PromptChatBubble = ({ message }: { message: string }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: message }}
      className="text-slate-600 leading-6"
    />
  );
};

const PromptChatBubbleSkeleton = () => {
  return (
    <>
      <Skeleton className="w-[full] h-[20px] rounded-xs" />
      <Skeleton className="w-[full] h-[20px] rounded-xs" />
      <Skeleton className="w-[full] h-[20px] rounded-xs" />
      <Skeleton className="w-[full] h-[20px] rounded-xs" />
      <Skeleton className="w-[80%] h-[20px] rounded-xs" />
    </>
  );
};

export { PromptChatBubbleSkeleton };
export default PromptChatBubble;
