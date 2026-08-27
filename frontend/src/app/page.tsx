import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 flex size-16 items-center justify-center rounded-full bg-foreground text-3xl font-bold text-background">
          𝕏
        </div>

        <h1 className="text-4xl font-bold tracking-tight">Acontecendo agora</h1>

        <p className="mt-3 max-w-sm text-muted-foreground">
          Entre na conversa do Mini X.
        </p>

        <div className="mt-8 w-full space-y-3">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full rounded-full font-bold",
            )}
          >
            Criar conta
          </Link>

          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
