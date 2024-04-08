import PromptChatApp from "@/components/PromptChatApp";

export default function Home() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center justify-between pb-40">
      <div className="container mx-auto pt-10">
        <div className="grid grid-cols-12">
          <div className="col-span-6">
            <header className="mb-10">
              <p
                className="font-bold text-3xl text-gray-700"
                style={{ lineHeight: 1.5 }}
              >
                Evite disperdício de alimentos e crie receitas incríveis.
              </p>
            </header>

            <PromptChatApp />
          </div>
        </div>
      </div>
    </main>
  );
}
