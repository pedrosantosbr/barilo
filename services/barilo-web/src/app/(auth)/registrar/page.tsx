import { RegisterForm } from "@/components/register-form";

export default async function Registrar() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-amber-400 p-4 absolute top-0 w-full h-14 border-b">
        Barilo
      </div>
      <div className="border rounded bg-background p-8 flex flex-col w-[400px] space-y-4">
        <h2 className="font-bold text-lg">Criar uma nova conta</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
