"use client";

import { FC } from "react";
import { Recipe } from "./Prompt.types";
import PromptChatBubble, { PromptChatBubbleSkeleton } from "./PromptChatBubble";

export type PromptChatBubbleListProps = {
  recipe: string;
  loading?: boolean;
};

const PromptChatBubbleList: FC<PromptChatBubbleListProps> = ({
  recipe,
  loading,
}) => {
  // reduce amount of rendering

  if (recipe.length === 0 && !loading) {
    return (
      <div>
        <div className="flex flex-col space-y-4 text-center">
          <p className="text-slate-500 text-sm">🍽 Exemplos</p>
          <div className="rounded bg-slate-50 p-4 px-8 text-muted-foreground">
            <p className="font-medium">
              2 cebolas, um pouco de arroz não cozido, restos de churrasco como
              linguiça e carne de boi, cebola, sal, azeite e farinha de
              mandioca.
            </p>
          </div>
          <div className="rounded bg-slate-50 p-4 px-8 text-muted-foreground">
            <p className="font-medium">
              2 cebolas, um pouco de arroz não cozido, restos de churrasco como
              linguiça e carne de boi, cebola, sal, azeite e farinha de
              mandioca.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {loading ? (
        <PromptChatBubbleSkeleton />
      ) : (
        <PromptChatBubble message={recipe} />
      )}
    </div>
  );
};

export default PromptChatBubbleList;
