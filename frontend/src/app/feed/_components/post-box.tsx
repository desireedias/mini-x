"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export const PostBox = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);

      // Obtém os dados de sessão atualizados
      const sessionData = await authClient.getSession();
      const token = sessionData?.data?.session?.token;

      if (!token) {
        console.error("Usuário não autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent("");
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Erro da API Django:", response.status, errorData);
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-b pb-4 space-y-3">
      <Avatar className="w-15 h-15   mt-1">
        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
        <AvatarFallback className="bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
          <User className="w-10 h-10" />
        </AvatarFallback>
      </Avatar>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que está acontecendo?"
        rows={3}
        className="w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground"
      />
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs text-muted-foreground">
          {280 - content.length} caracteres
        </span>
        <Button
          type="submit"
          disabled={!content.trim() || content.length > 280 || isSubmitting}
        >
          {isSubmitting ? "Postando..." : "Postar"}
        </Button>
      </div>
    </form>
  );
};
