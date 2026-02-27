"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { MaterialCard } from "@/components/lms/material-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Material } from "@/types/lms";
import { cn } from "@/components/ui/button";

type PortalRole = "student" | "teacher" | "principal" | "admin";

interface PortalMaterialsClientProps {
  role: PortalRole;
  materials: Material[];
}

type CurriculumChapter = {
  id: string;
  title: string;
  slug: string;
  position: number;
  weekRange: string;
  lessonCount: number;
};

type CurriculumSubject = {
  id: string;
  title: string;
  slug: string;
  position: number;
  description: string;
  chapterCount: number;
  lessonCount: number;
  chapters: CurriculumChapter[];
};

type CurriculumYear = {
  id: string;
  title: string;
  slug: string;
  position: number;
  yearLevel: number | null;
  subjects: CurriculumSubject[];
};

const roleLabels: Record<PortalRole, string> = {
  student: "Student Portal",
  teacher: "Teacher Portal",
  principal: "Principal Portal",
  admin: "Admin Portal",
};

function subjectMatches(materialSubject: string, subject: CurriculumSubject) {
  const normalizedMaterial = materialSubject.trim().toLowerCase();
  const normalizedTitle = subject.title.trim().toLowerCase();
  const normalizedSlug = subject.slug.trim().toLowerCase();
  const slugTokens = normalizedSlug.split("-").filter((token) => token.length > 1);

  if (normalizedMaterial.includes(normalizedTitle)) return true;
  if (slugTokens.some((token) => normalizedMaterial.includes(token))) return true;

  return false;
}

export function PortalMaterialsClient({ role, materials }: PortalMaterialsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [outlineLoading, setOutlineLoading] = useState(true);
  const [outlineError, setOutlineError] = useState("");
  const [years, setYears] = useState<CurriculumYear[]>([]);

  const [selectedYearSlug, setSelectedYearSlug] = useState("");
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOutline = async () => {
      setOutlineLoading(true);
      setOutlineError("");

      try {
        const response = await fetch("/api/curriculum/outline", { cache: "no-store" });
        const data = await response.json();

        if (!mounted) return;

        if (!response.ok || !data.ok) {
          setOutlineError(data.error || "Failed to load curriculum outline.");
          setYears([]);
          return;
        }

        setYears(Array.isArray(data.years) ? data.years : []);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setOutlineError("Failed to load curriculum outline.");
        setYears([]);
      } finally {
        if (mounted) setOutlineLoading(false);
      }
    };

    loadOutline();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (years.length === 0) {
      setSelectedYearSlug("");
      setSelectedSubjectSlug("");
      return;
    }

    if (!selectedYearSlug || !years.some((year) => year.slug === selectedYearSlug)) {
      setSelectedYearSlug(years[0].slug);
    }
  }, [years, selectedYearSlug]);

  const selectedYear = useMemo(
    () => years.find((year) => year.slug === selectedYearSlug) ?? null,
    [years, selectedYearSlug]
  );

  const subjects = selectedYear?.subjects ?? [];

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectSlug("");
      return;
    }

    if (!selectedSubjectSlug || !subjects.some((subject) => subject.slug === selectedSubjectSlug)) {
      setSelectedSubjectSlug(subjects[0].slug);
    }
  }, [subjects, selectedSubjectSlug]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.slug === selectedSubjectSlug) ?? null,
    [subjects, selectedSubjectSlug]
  );

  const selectedSubjectMaterials = useMemo(() => {
    if (!selectedSubject) return [];
    return materials.filter((material) => subjectMatches(material.subject, selectedSubject));
  }, [materials, selectedSubject]);

  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return selectedSubjectMaterials;

    return selectedSubjectMaterials.filter((material) =>
      [material.title, material.subject, material.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [selectedSubjectMaterials, searchQuery]);

  const subjectMaterialCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const year of years) {
      for (const subject of year.subjects) {
        counts[subject.id] = materials.filter((material) => subjectMatches(material.subject, subject)).length;
      }
    }

    return counts;
  }, [materials, years]);

  const cardRole = role === "teacher" ? "teacher" : "student";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        {role !== "admin" && (
          <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
            <div className="mb-8">
              <h2 className="text-lg font-bold">{roleLabels[role]}</h2>
            </div>
            <SidebarNav role={role} />
          </aside>
        )}

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Materials</h1>
              <p className="text-muted-foreground mt-2">
                Curriculum structure is loaded from Curriculum Portal (Year -&gt; Subject -&gt; Chapter -&gt; Lesson).
              </p>
            </div>

            {outlineLoading ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Loading curriculum outline...</CardContent>
              </Card>
            ) : outlineError ? (
              <Card>
                <CardContent className="p-6 text-sm text-red-600">{outlineError}</CardContent>
              </Card>
            ) : years.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No curriculum found yet. Create years, subjects, chapters, and lessons in Admin Curriculum Portal first.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Choose Year</CardTitle>
                    <CardDescription>All available year levels are managed from Curriculum Portal.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {years.map((year) => (
                      <Button
                        key={year.id}
                        type="button"
                        variant={year.slug === selectedYearSlug ? "default" : "outline"}
                        onClick={() => setSelectedYearSlug(year.slug)}
                      >
                        {year.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">Step 2</Badge>
                    <span className="text-muted-foreground">Choose subject in {selectedYear?.title}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">Step 3</Badge>
                    <span className="text-muted-foreground">Open chapter lesson plan</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {subjects.map((subject) => {
                      const isActive = subject.slug === selectedSubjectSlug;
                      const materialCount = subjectMaterialCounts[subject.id] ?? 0;

                      return (
                        <button
                          key={subject.id}
                          type="button"
                          onClick={() => setSelectedSubjectSlug(subject.slug)}
                          className={cn(
                            "text-left rounded-2xl border bg-white p-5 transition-all hover:shadow-sm",
                            isActive ? "border-primary ring-2 ring-primary/20" : "border-slate-200"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <Badge variant="secondary">{materialCount} materials</Badge>
                          </div>
                          <h3 className="mt-4 text-lg font-bold text-slate-900">{subject.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {subject.description || `${subject.chapterCount} chapters · ${subject.lessonCount} lessons`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {selectedYear && selectedSubject && (
                  <Card className="border-sky-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_55%),linear-gradient(to_bottom_right,_#ffffff,_#f8fbff)]">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-slate-900">
                            {selectedYear.title} {selectedSubject.title} Chapters
                          </CardTitle>
                          <CardDescription>
                            Lesson plans and ordering are fully managed from Curriculum Portal.
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{selectedSubject.chapterCount} chapters</Badge>
                          <Badge variant="secondary">{selectedSubject.lessonCount} lessons</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedSubject.chapters.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          No chapters yet for this subject.
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {selectedSubject.chapters.map((chapter, index) => (
                            <Card key={chapter.id} className="border-slate-200">
                              <CardContent className="p-4 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Chapter {index + 1}
                                </p>
                                <p className="font-semibold text-slate-900 leading-tight">{chapter.title}</p>
                                <p className="text-xs text-slate-600">{chapter.weekRange || "Week range not set"}</p>
                                <p className="text-xs text-slate-500">{chapter.lessonCount} lessons</p>
                                <Button asChild size="sm" className="w-full mt-2">
                                  <Link
                                    href={`/${role}/materials/curriculum/${selectedYear.slug}/${selectedSubject.slug}/${chapter.slug}`}
                                  >
                                    Open Chapter
                                  </Link>
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedSubject ? `${selectedSubject.title} Materials` : "Subject Materials"}
                </CardTitle>
                <CardDescription>
                  Materials filtered by currently selected curriculum subject.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search subject materials..."
                    className="pl-10"
                  />
                </div>

                {filteredMaterials.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMaterials.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        role={cardRole}
                        href={`/${role}/materials/${material.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="font-medium text-slate-900">No materials found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try another subject or search keyword.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
