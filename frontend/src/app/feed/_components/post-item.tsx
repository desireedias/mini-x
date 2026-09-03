"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_URL } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Heart, MessageCircle, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface PostData {
  id: number;
  author: {
    id: number;
    username: string;
    avatar: string | null;
  };
  content: string;
  media: string | null;
  created_at: string;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
}

export const PostItem = ({ post }: { post: PostData }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const sessionData = await authClient.getSession();
      if (sessionData?.data?.user?.username) {
        setCurrentUsername(sessionData.data.user.username);
      }
    }
    fetchUser();
  }, []);

  console.log({
    postAuthor: post.author.username,
    currentUsername: currentUsername,
    isAuthor: currentUsername === post.author.username,
  });

  const handleToggleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    const sessionData = await authClient.getSession();
    const token = sessionData?.data?.session?.token;

    if (!token) return;

    setIsLiked(!previousLiked);
    setLikesCount((prev) => (previousLiked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`${API_URL}/api/posts/${post.id}/like/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.is_liked);
        setLikesCount(data.likes_count);
      } else {
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
      }
    } catch {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

    const sessionData = await authClient.getSession();
    const token = sessionData?.data?.session?.token;

    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/posts/${post.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok || res.status === 204) {
        setIsDeleted(true);
      } else {
        alert("Erro ao excluir o post.");
      }
    } catch (error) {
      console.error("Erro na requisição de exclusão:", error);
    }
  };

  if (isDeleted) return null;

  const isAuthor = currentUsername === post.author.username;

  return (
    <article className="py-4 border-b flex gap-3">
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={post.author.avatar || ""}
          alt={post.author.username}
        />
        <AvatarFallback className="bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
          <User className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">@{post.author.username}</span>
            <span className="text-xs text-muted-foreground">
              • {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>

          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              title="Excluir publicação"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-6 pt-2">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 text-xs transition ${
              isLiked
                ? "text-red-500 font-semibold"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <Link
            href={`/feed/post/${post.id}`}
            className="flex items-center gap-1 hover:text-blue-500 text-xs transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.replies_count}</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
