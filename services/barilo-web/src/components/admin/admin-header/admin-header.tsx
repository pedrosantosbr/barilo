import { HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Megaphone } from "lucide-react";

export const AdminHeader = () => {
  return (
    <header className="bg-background border-b">
      <div className="h-14 flex items-center px-8">
        <div className="">
          <div className="font-bold text-2xl">Barilo</div>
        </div>
        <div className="flex items-center self-center"></div>
        <div className="ml-auto">
          <nav>
            <ul className="flex space-x-4 items-center font-medium">
              <li>
                <Link href="/" className="flex items-center">
                  <HomeIcon className="mr-2 w-4" /> Menu inicial
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="flex items-center">
                  <Megaphone className="mr-2 w-4" /> Encartes
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/*  */}
    </header>
  );
};
