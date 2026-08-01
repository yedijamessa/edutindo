export type CurriculumAssignmentRecord = {
  id: string;
  email: string;
  schoolSlug: string;
  schoolTitle: string;
  yearSlug: string;
  yearTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  moduleId: string;
  moduleTitle: string;
  assignedAt: string;
  assignedByEmail: string;
  href: string;
};

export type CurriculumAssignmentStudent = {
  key: string;
  userId: string | null;
  email: string;
  name: string;
  portals: string[];
  schoolSlugs: string[];
  status: "active" | "unverified" | "pending";
  assignments: CurriculumAssignmentRecord[];
};

export type CurriculumAssignmentOption = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  schoolSlug: string;
  schoolTitle: string;
  yearSlug: string;
  yearTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  label: string;
};

export type CurriculumAssignmentPortalData = {
  users: CurriculumAssignmentStudent[];
  moduleOptions: CurriculumAssignmentOption[];
};
