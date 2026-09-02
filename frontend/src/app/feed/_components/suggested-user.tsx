"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { API_URL } from "@/lib/api";

interface SuggestedUser {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
}

export function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);

  const fetchSuggestions = async () => {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/users/suggested/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (users.length === 0) {
    return <p className="text-sm text-gray-500">Sem sugestões no momento.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <Link
            href={`/feed/profile/${user.username}`}
            className="flex items-center gap-2"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-bold text-gray-900">
                {user.name || user.username}
              </p>
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </Link>

          <Link href={`/feed/profile/${user.username}`}>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs"
            >
              Ver perfil
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
