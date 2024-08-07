import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";

export default async function AdminLogin() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-amber-400 p-4 absolute top-0 w-full h-14 border-b">
        Barilo
      </div>
      <div className="border rounded bg-background p-8 flex flex-col w-[400px] space-y-4">
        <h2 className="font-bold text-lg">Central do Anunciante</h2>
        <LoginForm />
        <Button variant={"link"} className="">
          Esqueci minha senha
        </Button>
      </div>
    </div>
  );
}
