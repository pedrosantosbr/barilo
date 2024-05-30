"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const form = z.object({
  email: z.string().email({ message: "Campo email é obrigatório" }),
  password: z.string(),
});
export type LoginForm = z.infer<typeof form>;

export const LoginForm = () => {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(form),
  });

  const { errors } = formState;

  const handleOnSubmit = async (data: LoginForm) => {
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <form
      method="post"
      className="space-y-4"
      onSubmit={handleSubmit(handleOnSubmit)}
    >
      <Input {...register("email")} placeholder="username" />
      {errors.email && (
        <small className="text-red-500">{errors.email.message}</small>
      )}
      <Input {...register("password")} placeholder="senha" type="password" />
      {errors.password && (
        <small className="text-red-500">{errors.password.message}</small>
      )}
      <Button type="submit">Entrar</Button>
    </form>
  );
};
