"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Insira um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    console.log("Dados de Login:", data);
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
                    autoComplete="current-password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-full font-bold"
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
