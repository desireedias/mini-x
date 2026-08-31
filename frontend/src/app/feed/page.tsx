import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import SignOutButton from "./components/sign-out-button";

const FeedPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>{session?.user.name}</h1>
      <h1>{session?.user.email}</h1>
      <SignOutButton />
    </div>
  );
};

export default FeedPage;
