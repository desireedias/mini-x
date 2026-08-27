"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Insira um e-mail válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    console.log("Dados de Cadastro:", data);
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full font-semibold"
      >
        Continuar com o Google
      </Button>

      <div className="relative my-4 flex items-center justify-center border-t border-border">
        <span className="absolute bg-background px-2 text-xs text-muted-foreground">
          ou
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          x
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-full font-bold"
          >
            {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
