import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";

export default async function CentralDoAnunciantePage() {
  return (
    <div className="min-h-screen grid grid-cols-2">
      <div className="bg-amber-400 p-8 flex flex-col w-[400px] space-y-4">
        <div>
          <h1 className="font-medium">Central do Anunciante</h1>
          <p className="text-sm">Venha fazer parte do nosso time</p>
        </div>
        <h2 className="font-bold text-lg">Login</h2>
        <LoginForm />
        <Button variant={"link"} className="">
          Esqueci minha senha
        </Button>
      </div>
    </div>
  );
}
