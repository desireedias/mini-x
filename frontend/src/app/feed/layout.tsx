import { Sidebar } from "./_components/sidebar";
import { SuggestedUsers } from "./_components/suggested-user";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-[1400px] mx-auto grid gap-6 px-4 md:grid-cols-[220px_1fr_320px]">
      {/* Coluna 1: Navegação lateral */}
      <Sidebar />

      {/* Coluna 2: Conteúdo central (Feed) */}
      <main className="py-6 border-r border-l px-6 min-h-screen">
        {children}
      </main>

      {/* Coluna 3: Sugestões / Widgets */}
      <aside className="py-6 hidden md:block pl-2">
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl">
          <h3 className="font-bold text-sm mb-3">Sugestões de quem seguir</h3>
          <SuggestedUsers />
        </div>
      </aside>
    </div>
  );
}
