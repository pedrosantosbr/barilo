import Link from "next/link";
import PromptChatApp from "../PromptChatApp";

export const ReciptsPrompt = () => {
  return (
    <div className="grid grid-cols-12 gap-6 container">
      <div className="col-span-8">
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
      <aside className="col-span-4 p-4">
        <h4 className="font-extrabold text-lg pt-24 uppercase">Receitas</h4>
        <div className="recipe-feed">
          <div className="recipe">
            <div className="recipe-content">
              <Link
                href={"https://surferseo.com/blog/organic-search-results/"}
                className="font-bold text-indigo-600 text-lg"
              >
                Bolo de cenoura
              </Link>
              <p className="text-sm font-medium">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat
                quisquam labore sapiente id vitae ipsam commodi excepturi vel
                incidunt atque ipsa dolorem optio, beatae aliquid culpa! Quidem
                placeat vero maiores.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
