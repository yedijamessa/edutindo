"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Save, Send, X } from "lucide-react";
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
  schoolSlugs: string[];
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
  const [draftSchoolSlugs, setDraftSchoolSlugs] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteSchoolSlug, setInviteSchoolSlug] = useState("");
  const [invitePortals, setInvitePortals] = useState<Set<string>>(new Set(["admin"]));
  const [userSearch, setUserSearch] = useState("");
  const [portalFilters, setPortalFilters] = useState<Set<string>>(new Set());
  const [schoolFilter, setSchoolFilter] = useState("all");

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
      const nextSchoolDrafts: Record<string, Set<string>> = {};
      for (const user of loadedUsers) {
        nextDrafts[user.id] = new Set(user.portals);
        nextSchoolDrafts[user.id] = new Set(user.schoolSlugs ?? (user.schoolSlug ? [user.schoolSlug] : []));
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

  const toggleSchool = (userId: string, schoolSlug: string) => {
    setDraftSchoolSlugs((prev) => {
      const next = { ...prev };
      const current = new Set(next[userId] ?? []);

      if (current.has(schoolSlug)) {
        current.delete(schoolSlug);
      } else {
        current.add(schoolSlug);
      }

      next[userId] = current;
      return next;
    });
  };

  const toggleInvitePortal = (portal: string) => {
    setInvitePortals((prev) => {
      const next = new Set(prev);
      if (next.has(portal)) {
        next.delete(portal);
      } else {
        next.add(portal);
      }
      return next;
    });
  };

  const togglePortalFilter = (portal: string) => {
    setPortalFilters((prev) => {
      const next = new Set(prev);
      if (next.has(portal)) {
        next.delete(portal);
      } else {
        next.add(portal);
      }
      return next;
    });
  };

  const clearUserFilters = () => {
    setUserSearch("");
    setPortalFilters(new Set());
    setSchoolFilter("all");
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      if (query) {
        const searchableText = [
          user.email,
          user.firstName,
          user.lastName,
          `${user.firstName} ${user.lastName}`.trim(),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      if (portalFilters.size > 0 && !Array.from(portalFilters).some((portal) => user.portals.includes(portal))) {
        return false;
      }

      const userSchoolSlugs = user.schoolSlugs ?? (user.schoolSlug ? [user.schoolSlug] : []);
      if (schoolFilter === "unassigned") return userSchoolSlugs.length === 0;
      if (schoolFilter !== "all" && !userSchoolSlugs.includes(schoolFilter)) return false;

      return true;
    });
  }, [portalFilters, schoolFilter, userSearch, users]);

  const hasUserFilters = userSearch.trim() || portalFilters.size > 0 || schoolFilter !== "all";

  const sendInvite = async () => {
    setIsInviting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          firstName: inviteFirstName,
          lastName: inviteLastName,
          schoolSlug: inviteSchoolSlug || null,
          portals: Array.from(invitePortals),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to send invitation.");
        return;
      }

      setMessage(data.message || `Invitation sent to ${inviteEmail.trim().toLowerCase()}.`);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteSchoolSlug("");
      setInvitePortals(new Set(["admin"]));
    } catch (inviteError) {
      console.error(inviteError);
      setError("Failed to send invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const savePortals = async (user: AdminUser) => {
    setSavingUserId(user.id);
    setError(null);
    setMessage(null);

    try {
      const selected = Array.from(draftPortals[user.id] ?? []);
      const selectedSchoolSlugs = Array.from(draftSchoolSlugs[user.id] ?? []);
      const response = await fetch(`/api/admin/users/${user.id}/portals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portals: selected,
          schoolSlugs: selectedSchoolSlugs,
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
            Signed in as <span className="font-medium text-foreground">{adminEmail}</span>. Configure which portals and schools each user can access.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden border-sky-200/80 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(248,250,255,0.98))] shadow-[0_24px_70px_-48px_rgba(37,99,235,0.55)]">
        <CardHeader className="border-b border-sky-100/80 bg-white/35 backdrop-blur-sm">
          <CardTitle className="text-xl">Invite People</CardTitle>
          <CardDescription>
            Send a setup link so a new teammate can create their account, choose a password, and receive the assigned access automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-transparent">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="invite-email">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="invite-first-name">
                First name
              </label>
              <input
                id="invite-first-name"
                value={inviteFirstName}
                onChange={(event) => setInviteFirstName(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="invite-last-name">
                Last name
              </label>
              <input
                id="invite-last-name"
                value={inviteLastName}
                onChange={(event) => setInviteLastName(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="invite-school">
              Primary school
            </label>
            <select
              id="invite-school"
              value={inviteSchoolSlug}
              onChange={(event) => setInviteSchoolSlug(event.target.value)}
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {PORTAL_OPTIONS.map((portal) => {
              const checked = invitePortals.has(portal);

              return (
                <label
                  key={portal}
                  className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInvitePortal(portal)}
                    className="h-4 w-4"
                  />
                  <span>{portalLabels[portal]}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={sendInvite}
              disabled={isInviting || !inviteEmail.trim() || invitePortals.size === 0}
            >
              {isInviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Invite People
                </>
              )}
            </Button>
          </div>
        </CardContent>
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
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_280px_auto]">
                <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </label>

                <select
                  value={schoolFilter}
                  onChange={(event) => setSchoolFilter(event.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm"
                  aria-label="Filter by school"
                >
                  <option value="all">All schools</option>
                  <option value="unassigned">No school assigned</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.slug}>
                      {school.title}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearUserFilters}
                  disabled={!hasUserFilters}
                  className="justify-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {PORTAL_OPTIONS.map((portal) => {
                  const active = portalFilters.has(portal);

                  return (
                    <button
                      key={portal}
                      type="button"
                      onClick={() => togglePortalFilter(portal)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-background text-slate-700 hover:bg-slate-50"
                      }`}
                      aria-pressed={active}
                    >
                      {portalLabels[portal]}
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </CardContent>
          </Card>

          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No users match the selected filters.
              </CardContent>
            </Card>
          ) : null}

          {filteredUsers.map((user) => {
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
                        {(draftSchoolSlugs[user.id]?.size ?? 0) > 0
                          ? `${draftSchoolSlugs[user.id]?.size ?? 0} school${(draftSchoolSlugs[user.id]?.size ?? 0) === 1 ? "" : "s"}`
                          : "No school"}
                      </Badge>
                      <Badge variant="secondary">{selectedPortals.size} portals</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Schools
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {schools.map((school) => (
                        <label
                          key={school.id}
                          className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={draftSchoolSlugs[user.id]?.has(school.slug) ?? false}
                            onChange={() => toggleSchool(user.id, school.slug)}
                            className="h-4 w-4"
                          />
                          <span>{school.title}</span>
                        </label>
                      ))}
                    </div>
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
