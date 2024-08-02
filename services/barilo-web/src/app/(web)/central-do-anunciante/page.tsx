"use server";

import { getServerSession } from "next-auth";

export default async function CentralDoAnunciante() {
  const session = await getServerSession();
  console.log(session);

  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pb-40">
      <div className="container pt-16">
        <h1 className="text-5xl font-black tracking-tight">
          Anuncie seus produtos conosco
        </h1>
        <p className="w-1/2 mt-4">
          Aumente o seu alcance de vendas com nosso sistema de vendas
          direcionadas. Entre em contato pelo email <b>pedro357bm@gmail.com</b>
        </p>
        {/* <ul className="mt-10 flex space-x-4">
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
        </ul> */}
      </div>
    </main>
  );
}
