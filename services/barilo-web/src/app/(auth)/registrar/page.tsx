import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function Registrar() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-amber-400 p-4 absolute top-0 w-full h-14 border-b">
        Barilo
      </div>
      <div className="border rounded bg-background p-8 flex flex-col w-[400px] space-y-4">
        <h2 className="font-bold text-lg">Criar uma nova conta</h2>
        <Input placeholder="username" />
        <Input placeholder="email" />
        <Input placeholder="senha" type="password" />
        <Input placeholder="confirmar senha" type="password" />
        <Button>Criar conta</Button>
      </div>
    </div>
  );
}
