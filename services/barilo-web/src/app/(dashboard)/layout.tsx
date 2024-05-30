"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "@radix-ui/react-icons";
import { CogIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { ListTreeIcon } from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="bg-background">
      <div className="pl-[250px]">
        <div className="fixed left-0 border-r w-[250px] min-h-screen bg-amber-400">
          <h2 className="p-4">Barilo</h2>
          <hr className="border-amber-600/20" />
          <h2 className="p-4 font-bold">Menu</h2>
          <div className="px-4">
            <Button
              onClick={() => {
                router.push("/admin/encartes");
              }}
              variant={"ghost"}
              className="font-medium mb-5 w-full bg-amber-300 hover:bg-amber-300 flex justify-start"
            >
              <UploadIcon className="w-4 mr-2" /> Upload Encarte
            </Button>
            <Button
              onClick={() => {
                router.push("/admin/encartes");
              }}
              variant={"ghost"}
              className="font-medium w-full hover:bg-amber-300 flex justify-start"
            >
              <ListTreeIcon className="w-4 mr-2" /> Encartes
            </Button>
            <Button
              variant={"ghost"}
              className="font-medium w-full hover:bg-amber-300 flex justify-start"
            >
              <CogIcon className="w-4 mr-2" /> Configurações
            </Button>
          </div>
        </div>
        <div>
          <AdminHeader />
          {children}
        </div>
      </div>
    </div>
  );
}
