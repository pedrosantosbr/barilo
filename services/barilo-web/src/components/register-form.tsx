"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const form = z.object({
  email: z.string().email({ message: "Campo email é obrigatório" }),
  first_name: z.string(),
  last_name: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
});

export type RegisterForm = z.infer<typeof form>;

export const RegisterForm = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(form),
  });

  const router = useRouter();

  const { errors } = formState;

  const handleOnSubmit = async (data: RegisterForm) => {
    setError("");
    setIsLoading(true);

    const payload = {
      name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    };

    try {
      const rest = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/create-account/`,
        {
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(payload),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!rest.ok) {
        const err = await rest.json();
        console.log(err, rest.status);
        setError("Erro ao criar conta");
        return;
      }

      router.push("/login");
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

      <Input {...register("email")} placeholder="email" />
      {errors.email && (
        <small className="text-red-500">{errors.email.message}</small>
      )}
      <Input {...register("first_name")} placeholder="Nome" />
      {errors.first_name && (
        <small className="text-red-500">{errors.first_name.message}</small>
      )}
      <Input {...register("last_name")} placeholder="Sobrenome" />
      {errors.last_name && (
        <small className="text-red-500">{errors.last_name.message}</small>
      )}
      <Input {...register("password")} placeholder="senha" type="password" />
      {errors.password && (
        <small className="text-red-500">{errors.password.message}</small>
      )}
      <Input
        {...register("password_confirmation")}
        placeholder="confirmar senha"
        type="password"
      />
      {errors.password_confirmation && (
        <small className="text-red-500">
          {errors.password_confirmation.message}
        </small>
      )}
      <Button disabled={isLoading} className="w-full" type="submit">
        {isLoading ? <Loader2 className="animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
};
