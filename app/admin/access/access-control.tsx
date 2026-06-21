"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PORTAL_OPTIONS } from "@/lib/auth-shared";

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  isAdmin: boolean;
  portals: string[];
  schoolSlug: string | null;
  createdAt: string;
};

type SchoolOption = {
  id: string;
  title: string;
  slug: string;
};

interface AccessControlProps {
  adminEmail: string;
}

export function AccessControl({ adminEmail }: AccessControlProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [draftPortals, setDraftPortals] = useState<Record<string, Set<string>>>({});
  const [draftSchoolSlugs, setDraftSchoolSlugs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const portalLabels = useMemo(
    () => ({
      student: "Student",
      teacher: "Teacher",
      parent: "Parent",
      principal: "Principal",
      admin: "Admin",
      curriculum: "Curriculum",
    }),
    []
  );

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to load users.");
        return;
      }

      const loadedUsers: AdminUser[] = data.users;
      setUsers(loadedUsers);

      const nextDrafts: Record<string, Set<string>> = {};
      const nextSchoolDrafts: Record<string, string> = {};
      for (const user of loadedUsers) {
        nextDrafts[user.id] = new Set(user.portals);
        nextSchoolDrafts[user.id] = user.schoolSlug ?? "";
      }
      setDraftPortals(nextDrafts);
      setDraftSchoolSlugs(nextSchoolDrafts);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const response = await fetch("/api/curriculum/outline", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to load schools.");
        return;
      }

      setSchools(
        Array.isArray(data.schools)
          ? data.schools.map((school: SchoolOption) => ({
              id: school.id,
              title: school.title,
              slug: school.slug,
            }))
          : []
      );
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load schools.");
    }
  };

  useEffect(() => {
    loadUsers();
    loadSchools();
  }, []);

  const togglePortal = (userId: string, portal: string) => {
    setDraftPortals((prev) => {
      const next = { ...prev };
      const current = new Set(next[userId] ?? []);

      if (current.has(portal)) {
        current.delete(portal);
      } else {
        current.add(portal);
      }

      next[userId] = current;
      return next;
    });
  };

  const updateSchool = (userId: string, schoolSlug: string) => {
    setDraftSchoolSlugs((prev) => ({
      ...prev,
      [userId]: schoolSlug,
    }));
  };

  const savePortals = async (user: AdminUser) => {
    setSavingUserId(user.id);
    setError(null);
    setMessage(null);

    try {
      const selected = Array.from(draftPortals[user.id] ?? []);
      const response = await fetch(`/api/admin/users/${user.id}/portals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portals: selected,
          schoolSlug: draftSchoolSlugs[user.id] || null,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to save portals.");
        return;
      }

      setMessage(`Updated access for ${user.email}.`);
      await loadUsers();
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to save portals.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Access Control</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium text-foreground">{adminEmail}</span>. Configure which portals and school each user can access.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading users...
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => {
            const selectedPortals = draftPortals[user.id] ?? new Set<string>();
            const isSaving = savingUserId === user.id;

            return (
              <Card key={user.id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{user.email}</p>
                      {(user.firstName || user.lastName) && (
                        <p className="text-sm text-muted-foreground">
                          {`${user.firstName} ${user.lastName}`.trim()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(user.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isAdmin && <Badge>Admin</Badge>}
                      <Badge variant={user.emailVerified ? "default" : "secondary"}>
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge variant="secondary">
                        {draftSchoolSlugs[user.id]
                          ? schools.find((school) => school.slug === draftSchoolSlugs[user.id])?.title ?? "School assigned"
                          : "No school"}
                      </Badge>
                      <Badge variant="secondary">{selectedPortals.size} portals</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor={`school-${user.id}`}>
                      School
                    </label>
                    <select
                      id={`school-${user.id}`}
                      value={draftSchoolSlugs[user.id] ?? ""}
                      onChange={(event) => updateSchool(user.id, event.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No school assigned</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.slug}>
                          {school.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {PORTAL_OPTIONS.map((portal) => {
                      const checked = selectedPortals.has(portal);

                      return (
                        <label
                          key={portal}
                          className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePortal(user.id, portal)}
                            className="h-4 w-4"
                          />
                          <span>{portalLabels[portal]}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => savePortals(user)} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Access
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
