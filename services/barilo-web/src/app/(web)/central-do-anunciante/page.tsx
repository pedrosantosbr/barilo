"use server";

import Link from "next/link";
import { getServerSession } from "next-auth";

export default async function CentralDoAnunciante() {
  const session = await getServerSession();
  console.log(session);

  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="container pt-16">
        <h1 className="text-xl font-bold">Anunciar seus produtos</h1>
        <p>Crie campanhas especializadas para aumentar as suas vendas</p>
        <ul className="mt-10 flex space-x-4">
          <li>
            <Link href={"/registrar"} className="underline text-blue-600">
              Criar conta
            </Link>
          </li>
          <li>ou</li>
          {session ? (
            <li>
              <Link
                href={`/login?redirect=/admin`}
                className="underline text-blue-600"
              >
                Já possuo uma conta
              </Link>
            </li>
          ) : (
            <li>
              <Link href={"/admin"} className="underline text-blue-600">
                Já possuo uma conta
              </Link>
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
