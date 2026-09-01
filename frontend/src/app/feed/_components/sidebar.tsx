"use client";

import Link from "next/link";
import { Home, User, Bell } from "lucide-react";
import SignOutButton from "./sign-out-button";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Sidebar = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data?.user) {
        const currentUsername =
          session.data.user.username || session.data.user.email;
        setUsername(currentUsername);
      }
    });
  }, []);
  return (
    <aside className="py-6 flex flex-col justify-between h-screen sticky top-0 pr-4">
      <div className="space-y-6">
        <div className="font-bold text-xl px-3">Mini-X</div>

        <nav className="space-y-2">
          <Link
            href="/feed"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Home Page</span>
          </Link>

          <Link
            href={username ? `/feed/profile/${username}` : "/feed"}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent font-medium"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </nav>
      </div>

      <div className="pt-4 pb-20 border-t">
        <SignOutButton />
      </div>
    </aside>
  );
};
