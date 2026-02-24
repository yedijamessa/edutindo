"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const INACTIVITY_CHECK_INTERVAL_MS = 60 * 1000;
const ACTIVITY_WRITE_THROTTLE_MS = 30 * 1000;
const LAST_ACTIVITY_STORAGE_KEY = "edutindo:last-activity-ts";

export function InactivitySignOut() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthenticatedRef = useRef(false);
  const lastActivityWriteRef = useRef(0);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    const loadAuthState = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (!isMounted) return;

        const authenticated = Boolean(data?.authenticated);
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const now = Date.now();
          lastActivityWriteRef.current = now;
          window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
        } else {
          window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
        }
      } catch {
        if (!isMounted) return;
        setIsAuthenticated(false);
        window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
      }
    };

    void loadAuthState();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateLastActivity = (force = false) => {
      if (!isAuthenticatedRef.current) return;

      const now = Date.now();
      if (!force && now - lastActivityWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) return;

      lastActivityWriteRef.current = now;
      window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
    };

    const handleUserActivity = () => {
      updateLastActivity(false);
    };

    const signOutForInactivity = async () => {
      if (isSigningOutRef.current) return;

      isSigningOutRef.current = true;
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
        setIsAuthenticated(false);
        isSigningOutRef.current = false;
        window.location.assign("/");
      }
    };

    const checkInactivity = async () => {
      const rawLastActivity = window.localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
      const parsedLastActivity = Number(rawLastActivity);

      if (!Number.isFinite(parsedLastActivity) || parsedLastActivity <= 0) {
        updateLastActivity(true);
        return;
      }

      if (Date.now() - parsedLastActivity >= INACTIVITY_TIMEOUT_MS) {
        await signOutForInactivity();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkInactivity();
      }
    };

    updateLastActivity(true);

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "pointerdown",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      void checkInactivity();
    }, INACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated]);

  return null;
}
