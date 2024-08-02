"use client";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-amber-400 flex p-4 absolute top-0 w-full h-14 border-b">
        Barilo
        <div className="ml-auto">
          <Link href={"/"} className="underline">
            Voltar a página principal
          </Link>
        </div>
      </div>
      <div className="border rounded bg-background p-8 flex flex-col w-[400px] space-y-4">
        <h2 className="font-bold text-lg">Login</h2>
        <LoginForm />
        <div className="flex items-center justify-center">
          <div className="h-0.5 w-full border-b border-gray-300"></div>
          <div className="flex-1 px-4">ou</div>
          <div className="h-0.5 w-full border-b border-gray-300"></div>
        </div>
        <Button onClick={() => router.push("/criar-conta")} className="">
          Criar conta
        </Button>
        {/* <Button
          onClick={() => router.push("/criar-conta")}
          variant={"link"}
          className=""
        >
          Esqueci minha senha
        </Button> */}
      </div>
    </div>
  );
}
