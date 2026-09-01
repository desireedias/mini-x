import { cookies } from "next/headers";
import { PostBox } from "./_components/post-box";
import { FeedList } from "./_components/feed-list";

async function getPosts() {
  try {
    const cookieStore = await cookies();

    // 1. Pega o valor bruto do cookie
    const rawToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-better-auth.session_token")?.value ||
      cookieStore.get("session_token")?.value;

    // 2. Remove a assinatura após o ponto (se existir) para enviar apenas o token puro
    const cleanToken = rawToken ? rawToken.split(".")[0] : null;

    const headers: Record<string, string> = {};

    if (cleanToken) {
      headers["Authorization"] = `Bearer ${cleanToken}`;
    }

    const res = await fetch("http://localhost:8000/api/posts/", {
      headers,
      cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Erro ao carregar posts no Server Component:", error);
    return [];
  }
}

export default async function FeedPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Home Page</h1>
      <PostBox />
      <FeedList posts={posts} />
    </div>
  );
}
