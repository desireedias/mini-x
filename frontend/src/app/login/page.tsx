import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Veja o que está acontecendo!</h1>

          <p className="text-sm text-muted-foreground">Já tem uma conta?</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
