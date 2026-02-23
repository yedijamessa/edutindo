export const PORTAL_OPTIONS = ["student", "teacher", "parent", "principal", "admin"] as const;
export type PortalKey = (typeof PORTAL_OPTIONS)[number];

export const SESSION_COOKIE_NAME = "edutindo_session";
