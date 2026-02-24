export const PORTAL_ZOOM_MEETING = {
  url: "https://us02web.zoom.us/j/9668088902?pwd=cPFhIbQlS2dGZRZEMSE4dPF0q0sFX1.1&omn=84085576589",
  meetingId: "966 808 8902",
  passcode: "2030300",
} as const;

export function getPortalMeetingLink(type?: string, existingLink?: string | null) {
  if (type === "class" || type === "meeting") {
    return PORTAL_ZOOM_MEETING.url;
  }

  return existingLink ?? undefined;
}
