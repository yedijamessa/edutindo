"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CurrentUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  portals: string[];
};

interface AuthNavActionsProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AuthNavActions({ mobile = false, onNavigate }: AuthNavActionsProps) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    return (
      <div className="space-y-2">
        {user.isAdmin && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin" onClick={onNavigate}>
              Admin Dashboard
            </Link>
          </Button>
        )}
        <Button variant="outline" className="w-full" onClick={logout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.isAdmin && (
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
        {loggingOut ? "Logging out..." : "Log Out"}
      </Button>
    </div>
  );
}
