export type CurriculumPortalRole = "student" | "teacher" | "principal" | "admin";

interface CurriculumMaterialsSelection {
  schoolSlug?: string | null;
  yearSlug?: string | null;
  subjectSlug?: string | null;
}

export function buildCurriculumMaterialsHref(
  role: CurriculumPortalRole,
  selection: CurriculumMaterialsSelection = {}
) {
  const params = new URLSearchParams();

  if (selection.schoolSlug) {
    params.set("school", selection.schoolSlug);
  }

  if (selection.yearSlug) {
    params.set("year", selection.yearSlug);
  }

  if (selection.subjectSlug) {
    params.set("subject", selection.subjectSlug);
  }

  const query = params.toString();
  return `/${role}/materials${query ? `?${query}` : ""}`;
}
