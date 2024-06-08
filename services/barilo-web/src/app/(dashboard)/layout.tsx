"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "@radix-ui/react-icons";
import { UsersIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { MapPinIcon } from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="bg-muted">
      <div className="pl-[250px]">
        <div className="fixed left-0 border-r w-[250px] min-h-screen shadow-md bg-amber-400">
          <h2 className="p-4">Barilo</h2>
          <h2 className="p-4 font-bold">Menu</h2>
          <div className="px-4">
            <Button
              onClick={() => {
                router.push("/admin/encartes");
              }}
              variant={"ghost"}
              className="font-medium mb-5 w-full bg-amber-300 hover:bg-amber-300 flex justify-start text-slate-900"
            >
              <UploadIcon className="w-4 mr-2" /> Upload Encarte
            </Button>
            <Button
              onClick={() => {
                router.push("/admin/lojas");
              }}
              variant={"ghost"}
              className="font-medium w-full hover:bg-amber-300 flex justify-start"
            >
              <MapPinIcon className="w-4 mr-2" /> Lojas
            </Button>
            <Button
              onClick={() => {
                router.push("/admin/lojas");
              }}
              variant={"ghost"}
              className="font-medium w-full hover:bg-amber-300 flex justify-start"
            >
              <UsersIcon className="w-4 mr-2" /> CRM
            </Button>
            {/* <Button
              variant={"ghost"}
              className="font-medium w-full hover:bg-amber-300 flex justify-start"
            >
              <CogIcon className="w-4 mr-2" /> Configurações
            </Button> */}
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
