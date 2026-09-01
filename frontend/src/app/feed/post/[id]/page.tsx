"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { PostItem, PostData } from "@/app/feed/_components/post-item";

interface PostDetail extends PostData {
  replies: PostData[];
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostDetail = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do post:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    const sessionData = await authClient.getSession();
    const token = sessionData?.data?.session?.token;

    if (!token) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent, parent: id }),
      });

      if (res.ok) {
        setReplyContent("");
        fetchPostDetail();
      }
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Carregando post...</div>;
  if (!post) return <div className="p-4 text-center">Post não encontrado.</div>;

  return (
    <div className="w-full min-h-screen">
      {/* Topo com botão voltar */}
      <div className="flex items-center gap-4 p-4 border-b">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-75"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Post Principal (reutiliza PostItem) */}
      <PostItem post={post} />

      {/* Caixa para comentar */}
      <div className="p-4 border-b flex gap-3">
        <Avatar>
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Say something nice!"
            className="border-none focus-visible:ring-0 resize-none min-h-[60px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSendReply}
              disabled={isSubmitting || !replyContent.trim()}
              className="rounded-full px-5"
            >
              {isSubmitting ? "Enviando..." : "Reply"}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Respostas */}
      <div>
        {post.replies?.length > 0 ? (
          post.replies.map((reply) => <PostItem key={reply.id} post={reply} />)
        ) : (
          <p className="p-4 text-center text-sm text-gray-400">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}
      </div>
    </div>
  );
}
