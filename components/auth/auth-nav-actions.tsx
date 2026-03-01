"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveAuthenticatedHomePath } from "@/lib/auth-shared";

type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  isAdmin: boolean;
  portals: string[];
};

interface AuthNavActionsProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AuthNavActions({ mobile = false, onNavigate }: AuthNavActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isPortalOrAdminPage =
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/principal") ||
    pathname.startsWith("/admin");

  const shouldHideHomeAction = (homePath: string) => homePath === "/admin" && pathname.startsWith("/admin");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (!isMounted) return;
        setUser(data?.authenticated ? data.user : null);
      } catch (error) {
        console.error("auth state load error:", error);
      } finally {
        if (isMounted) setLoaded(true);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      onNavigate?.();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  if (!loaded) return null;

  if (!user) {
    if (isPortalOrAdminPage) {
      if (mobile) {
        return (
          <Button variant="outline" className="w-full" onClick={logout} disabled={loggingOut}>
            {loggingOut ? "Signing out..." : "Sign Out"}
          </Button>
        );
      }

      return (
        <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
          {loggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      );
    }

    if (mobile) {
      return (
        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login" onClick={onNavigate}>
              Log In
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/signup" onClick={onNavigate}>
              Sign Up
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  if (mobile) {
    const homePath = resolveAuthenticatedHomePath(user, "/dashboard");
    const homeLabel = homePath === "/admin" ? "Admin Dashboard" : "Dashboard";

    return (
      <div className="space-y-2">
        {!shouldHideHomeAction(homePath) && (
          <Button asChild variant="outline" className="w-full">
            <Link href={homePath} onClick={onNavigate}>
              {homeLabel}
            </Link>
          </Button>
        )}
        <Button variant="outline" className="w-full" onClick={logout} disabled={loggingOut}>
          {loggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    );
  }

  const homePath = resolveAuthenticatedHomePath(user, "/dashboard");
  const homeLabel = homePath === "/admin" ? "Admin Dashboard" : "Dashboard";

  return (
    <div className="flex items-center gap-2">
      {!shouldHideHomeAction(homePath) && (
        <Button asChild variant="outline" size="sm">
          <Link href={homePath}>{homeLabel}</Link>
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
        {loggingOut ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
