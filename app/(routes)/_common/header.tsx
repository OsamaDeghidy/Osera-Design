"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogOutIcon, MoonIcon, SunIcon, User as UserIcon, Gem } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();
  const isDark = theme === "dark";
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      axios.get("/api/user/me")
        .then((res) => setCredits(res.data.credits))
        .catch((e) => console.error(e));
    }
  }, [user]);

  return (
    <div className="sticky top-0 right-0 left-0 z-30">
      <header className="h-16 border-b bg-background py-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-4">
          <Logo />

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link href="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">
              Blog 📝
            </Link>
            <Link href="/gallery" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">
              Gallery 🌍
            </Link>
            <Link href="/pricing" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">
              Pricing 💎
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Credit Badge */}
            {user && credits !== null && (
              <Link href="/profile">
                <div className="hidden md:inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 cursor-pointer gap-1.5 mr-2">
                  <Gem size={12} className="text-primary" />
                  <span>{credits} Credits</span>
                </div>
              </Link>
            )}

            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full h-8 w-8"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <SunIcon className={cn("absolute h-5 w-5 transition", isDark ? "scale-100" : "scale-0")} />
              <MoonIcon className={cn("absolute h-5 w-5 transition", isDark ? "scale-0" : "scale-100")} />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 shrink-0 rounded-full border">
                    <AvatarImage src={user?.picture || ""} alt={user?.given_name || ""} />
                    <AvatarFallback className="rounded-lg">
                      {user?.given_name?.charAt(0)}
                      {user?.family_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full flex items-center cursor-pointer">
                      <UserIcon className="mr-2 size-4" />
                      Profile & Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogoutLink className="w-full flex items-center">
                      <LogOutIcon className="mr-2 size-4" />
                      Logout
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginLink>
                <Button size="sm">Sign in</Button>
              </LoginLink>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
