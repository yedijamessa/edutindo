export const PORTAL_OPTIONS = ["student", "teacher", "parent", "principal", "admin"] as const;
export type PortalKey = (typeof PORTAL_OPTIONS)[number];

export const SESSION_COOKIE_NAME = "edutindo_session";

const NON_ADMIN_PORTAL_PRIORITY: Exclude<PortalKey, "admin">[] = [
  "student",
  "teacher",
  "parent",
  "principal",
];

export const PORTAL_HOME_PATHS: Record<PortalKey, string> = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
  principal: "/principal",
  admin: "/admin",
};

type PortalResolverUser = {
  isAdmin?: boolean;
  portals: readonly string[];
};

export function resolvePrimaryPortal(user: PortalResolverUser): PortalKey | null {
  if (user.isAdmin || user.portals.includes("admin")) {
    return "admin";
  }

  for (const portal of NON_ADMIN_PORTAL_PRIORITY) {
    if (user.portals.includes(portal)) {
      return portal;
    }
  }

  return null;
}

export function resolveAuthenticatedHomePath(user: PortalResolverUser, fallback = "/dashboard?pending=1") {
  const portal = resolvePrimaryPortal(user);
  if (!portal) return fallback;
  return PORTAL_HOME_PATHS[portal];
}
