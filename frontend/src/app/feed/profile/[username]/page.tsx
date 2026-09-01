"use client";

import { useEffect, useState, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { PostItem, PostData } from "@/app/feed/_components/post-item";
import { FollowersModal } from "@/app/feed/_components/followers-modal"; // 👈 Importação
import { User } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  posts: PostData[];
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Estado simples para controlar a aba do modal
  const [activeTab, setActiveTab] = useState<"followers" | "following" | null>(
    null,
  );

  const fetchProfile = async () => {
    try {
      // 1. Aguarda a sessão ser obtida antes de disparar o fetch
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;

      console.log("DEBUG FRONT -> Token obtido da sessão:", token);

      // 2. Envia o token de autorização se ele existir
      const res = await fetch(`http://localhost:8000/api/users/${username}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        console.log(
          "DEBUG FRONT -> Dados do perfil recebidos do Django:",
          data,
        );
        console.log(
          "DEBUG FRONT -> data.is_following veio como:",
          data.is_following,
        );

        setProfile(data);
        setName(data.name || data.username);
        setBio(data.bio || "");
        setAvatarUrl(data.avatar || "");
        setBannerUrl(data.banner || "");

        // 3. Sincroniza o estado com a resposta vinda do backend
        setIsFollowing(Boolean(data.is_following));
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data?.user) {
        setCurrentUser(
          session.data.user.username ||
            session.data.user.name ||
            session.data.user.email,
        );
      }

      fetchProfile();
    });
  }, [username]);

  const handleFollowToggle = async () => {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;
    if (!token || !profile) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${profile.username}/follow/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setProfile((prev) =>
          prev ? { ...prev, followers_count: data.followers_count } : null,
        );
      }
    } catch (error) {
      console.error("Erro ao alternar follow:", error);
    }
  };

  const handleSaveProfile = async () => {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;
    if (!token) return;

    setIsSaving(true);

    const payload: Record<string, string> = {};
    if (name.trim()) payload.name = name;
    if (bio) payload.bio = bio;
    if (avatarUrl) payload.avatar = avatarUrl;
    if (bannerUrl) payload.banner = bannerUrl;
    if (newPassword.trim()) payload.password = newPassword;

    try {
      const res = await fetch(`http://localhost:8000/api/users/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditing(false);
        setNewPassword("");
        fetchProfile();
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return <div className="p-4 text-center">Carregando perfil...</div>;
  if (!profile)
    return <div className="p-4 text-center">Usuário não encontrado.</div>;

  const isOwner = currentUser === profile.username;

  return (
    <div className="w-full min-h-screen relative">
      {/* Banner */}
      <div className="h-32 md:h-48 bg-gray-200 relative">
        {profile.banner && (
          <img
            src={profile.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Cabeçalho do Perfil */}
      <div className="p-4 relative border-b">
        <div className="flex justify-between items-end -mt-16 mb-4">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          {isOwner ? (
            !isEditing && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setIsEditing(true)}
              >
                Editar perfil
              </Button>
            )
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="rounded-full px-6"
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Seguindo" : "Seguir"}
            </Button>
          )}
        </div>

        <div>
          <h1 className="font-bold text-xl">
            {profile.name || profile.username}
          </h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>
          )}

          {/* Botões para abrir o modal */}
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <button
              onClick={() => setActiveTab("following")}
              className="hover:underline text-left cursor-pointer"
            >
              <strong className="text-gray-900">
                {profile.following_count || 0}
              </strong>{" "}
              Seguindo
            </button>
            <button
              onClick={() => setActiveTab("followers")}
              className="hover:underline text-left cursor-pointer"
            >
              <strong className="text-gray-900">
                {profile.followers_count || 0}
              </strong>{" "}
              Seguidores
            </button>
          </div>
        </div>

        {/* Form de Edição */}
        {isEditing && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex flex-col gap-3">
            <h3 className="font-semibold text-sm">Configuração do Perfil</h3>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Nome de exibição
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Nova Senha (deixe em branco se não quiser alterar)
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="******"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                URL da Foto de Perfil
              </label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                URL do Banner
              </label>
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escreva algo sobre você..."
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Posts */}
      <div className="divide-y">
        {profile.posts?.length > 0 ? (
          profile.posts.map((post) => <PostItem key={post.id} post={post} />)
        ) : (
          <p className="p-4 text-center text-sm text-gray-400">
            Nenhum post publicado ainda.
          </p>
        )}
      </div>

      {/* Componente Modal Isolado */}
      <FollowersModal
        username={username}
        type={activeTab}
        onClose={() => setActiveTab(null)}
      />
    </div>
  );
}
