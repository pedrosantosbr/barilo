"use client";

import Link from "next/link";
import { ArrowRightSquare, LogOut, Megaphone } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export const AdminHeader = () => {
  const { status } = useSession();

  const pathname = usePathname();

  const isAuthenticated = status === "authenticated";

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
              {isAuthenticated && (
                <li>
                  <ProfileDropdownMenu />
                </li>
              )}
              {!isAuthenticated && (
                <li>
                  <Link
                    href={`/login?redirect=${pathname}`}
                    className="flex items-center"
                  >
                    <ArrowRightSquare className="mr-2 w-4" /> Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
      {/*  */}
    </header>
  );
};

export function ProfileDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="hover:bg-amber-300 bg-gradient-to-r from-amber-200/50 to-amber-200/20 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          variant={"ghost"}
        >
          <div className="flex items-center space-x-2">
            <div className="font-medium">Pedro Santos</div>
            <Avatar className="bg-amber-600/20 h-6 w-6" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          Sair
          <DropdownMenuShortcut>
            <LogOut className="w-4 text-black" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
