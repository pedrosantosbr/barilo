import PromptChatApp from "../PromptChatApp";

export const RecipeChatRoom = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3"></aside>
      <div className="col-span-6">
        <div className="mb-10 mt-10">
          <p
            className="font-bold text-3xl text-gray-700"
            style={{ lineHeight: 1.5 }}
          >
            Evite disperdício de alimentos e crie receitas incríveis.
          </p>
        </div>

        <PromptChatApp />
      </div>
    </div>
  );
};
