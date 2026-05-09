const curriculumLessonFocusRoutePattern =
  /^\/(student|teacher|principal|admin)\/materials\/curriculum\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/;

export function isCurriculumLessonFocusRoute(pathname: string | null | undefined) {
  if (!pathname) {
    return false;
  }

  return curriculumLessonFocusRoutePattern.test(pathname);
}
