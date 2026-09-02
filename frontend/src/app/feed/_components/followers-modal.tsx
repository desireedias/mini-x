"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { API_URL } from "@/lib/api";

interface UserListItem {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
}

interface FollowersModalProps {
  username: string;
  type: "followers" | "following" | null;
  onClose: () => void;
}

export function FollowersModal({
  username,
  type,
  onClose,
}: FollowersModalProps) {
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;

    const fetchUsers = async () => {
      setLoading(true);
      setUserList([]);

      try {
        const res = await fetch(`${API_URL}/api/users/${username}/${type}/`);
        if (res.ok) {
          const data = await res.json();
          setUserList(data);
        }
      } catch (error) {
        console.error(`Erro ao buscar ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [username, type]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4 max-h-[80vh] flex flex-col shadow-lg">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h2 className="font-bold text-lg capitalize">
            {type === "followers" ? "Seguidores" : "Seguindo"}
          </h2>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Lista de Usuários */}
        <div className="overflow-y-auto flex-1 divide-y">
          {loading ? (
            <p className="p-4 text-center text-sm text-gray-500">
              Carregando...
            </p>
          ) : userList.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-500">
              Nenhum usuário encontrado.
            </p>
          ) : (
            userList.map((u) => (
              <div
                key={u.id}
                className="py-3 flex items-center justify-between"
              >
                <Link
                  href={`/feed/profile/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>
                      {u.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      {u.name || u.username}
                    </p>
                    <p className="text-xs text-gray-500">@{u.username}</p>
                  </div>
                </Link>

                <Link href={`/feed/profile/${u.username}`} onClick={onClose}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs"
                  >
                    Ver perfil
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
