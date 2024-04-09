import PromptChatApp from "@/components/PromptChatApp";

export default function Home() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center justify-between pb-40">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-2"></aside>
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
    </main>
  );
}
