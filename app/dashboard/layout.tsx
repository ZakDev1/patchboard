import Link from "next/link";
import LogoutButton from "@/components/buttons/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, createCheckoutSession } from "@/lib/actions/stripe";
import Image from "next/image";
import { Zap } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const avatarUrl = user?.user_metadata?.avatar_url ?? "";
  const username = user?.user_metadata?.user_name ?? "";
  const plan = await getUserPlan();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/icon.svg" alt="Patchboard" width={25} height={25} />
            <span className="font-semibold text-sm tracking-tight">Patchboard</span>
          </Link>
          <div className="flex items-center gap-3">
            {plan === "free" ? (
              <form action={createCheckoutSession}>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white"
                >
                  <Zap className="size-3" />
                  Upgrade to Pro
                </Button>
              </form>
            ) : (
              <Badge className="h-5 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                Pro
              </Badge>
            )}
            <Separator orientation="vertical" className="h-4" />
            <Link href="/dashboard/settings">
              <Avatar className="h-7 w-7 cursor-pointer ring-offset-background transition-all hover:ring-2 hover:ring-zinc-300 hover:ring-offset-1">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xs">{username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
