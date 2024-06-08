import { cookies } from "next/headers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function getMarket() {
  const cookie = cookies().get("barilo.access-token");
  try {
    const resp = await fetch(`${process.env.API_URL}/api/v1/admin/market/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie?.value}`,
      },
    });

    console.log(resp.status);
    if (resp.status === 401) return null;

    const markets = await resp.json();
    console.log(markets);
    console.log("🎃 success");
    if (markets.legnth === 0) return null;
    return markets[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function Dashboard() {
  const market = await getMarket();

  return (
    <main className="flex container pt-16 min-h-screen overflow-y-auto flex-col items-center">
      {!market && <RegisterMarketAlert />}
    </main>
  );
}

export function RegisterMarketAlert() {
  return (
    <Alert>
      <RocketIcon className="h-4 w-4" />
      <AlertTitle>Registrar novo mercado</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>
            Clique no botão abaixo para registrar seu mercado e começar a
            divulgar seus produtos!
          </p>
          <AddMarket />
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function AddMarket() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Registrar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar mercado</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
