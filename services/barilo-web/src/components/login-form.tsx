"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const form = z.object({
  email: z.string().email({ message: "Campo email é obrigatório" }),
  password: z.string(),
});
export type LoginForm = z.infer<typeof form>;

export const LoginForm = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(form),
  });

  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "";

  const router = useRouter();

  const { errors } = formState;

  const handleOnSubmit = async (data: LoginForm) => {
    setError("");
    setIsLoading(true);
    try {
      const rest = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/token/`,
        {
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(data),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!rest.ok) {
        const err = await rest.json();
        console.log(err, rest.status);
        setError("Usuário ou senha inválidos");
        return;
      }

      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!res) {
        setError("Erro desconhecido, tente novamente mais tarde!");
        return;
      }

      if (!res.ok) {
        console.log(res.error);
        setError("Usuário ou senha inválidos");
        return;
      }

      if (redirect !== "") {
        console.log("here");
        router.replace(redirect);
        return;
      }
      router.push("/encartes");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      method="post"
      className="space-y-4"
      onSubmit={handleSubmit(handleOnSubmit)}
    >
      {!!error && <p className="text-red-500">{error}</p>}

      <Input {...register("email")} placeholder="username" />
      {errors.email && (
        <small className="text-red-500">{errors.email.message}</small>
      )}
      <Input {...register("password")} placeholder="senha" type="password" />
      {errors.password && (
        <small className="text-red-500">{errors.password.message}</small>
      )}
      <Button disabled={isLoading} className="w-full" type="submit">
        {isLoading ? <Loader2 className="animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
};
