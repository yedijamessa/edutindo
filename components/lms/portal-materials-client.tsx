"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, FlaskConical, Search } from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MaterialCard } from "@/components/lms/material-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Material } from "@/types/lms";
import { YEAR7_SCIENCE_TOTAL_LESSONS, year7ScienceChapters } from "@/lib/curriculum/year7/science";
import { cn } from "@/components/ui/button";

type PortalRole = "student" | "teacher" | "principal" | "admin";

interface PortalMaterialsClientProps {
  role: PortalRole;
  materials: Material[];
}

type SubjectOption = {
  slug: string;
  label: string;
  description: string;
  aliases: string[];
  years: string[];
};

const roleLabels: Record<PortalRole, string> = {
  student: "Student Portal",
  teacher: "Teacher Portal",
  principal: "Principal Portal",
  admin: "Admin Portal",
};

const subjectOptions: SubjectOption[] = [
  {
    slug: "science",
    label: "Science",
    description: "Physics, chemistry, biology, and scientific inquiry.",
    aliases: ["science", "sains", "biology", "chemical", "physical"],
    years: ["year-7", "year-8", "year-9"],
  },
  {
    slug: "mathematics",
    label: "Mathematics",
    description: "Number, algebra, geometry, and applied numeracy.",
    aliases: ["math", "mathematics", "numerasi", "algebra", "geometry"],
    years: ["year-7", "year-8", "year-9"],
  },
  {
    slug: "english",
    label: "English",
    description: "Reading, writing, communication, and comprehension.",
    aliases: ["english", "reading", "writing", "literacy"],
    years: ["year-7", "year-8", "year-9"],
  },
  {
    slug: "bahasa-indonesia",
    label: "Bahasa Indonesia",
    description: "Bahasa literacy, text analysis, and communication.",
    aliases: ["bahasa", "indonesia", "literasi", "teks"],
    years: ["year-7", "year-8", "year-9"],
  },
  {
    slug: "social-studies",
    label: "Social Studies",
    description: "History, society, geography, and civic understanding.",
    aliases: ["social", "history", "geography", "civics"],
    years: ["year-7", "year-8", "year-9"],
  },
  {
    slug: "technology",
    label: "Technology",
    description: "Digital skills, coding basics, and technology use.",
    aliases: ["technology", "computer", "coding", "it", "steam"],
    years: ["year-7", "year-8", "year-9"],
  },
];

const yearLabel = (year: string) => year.replace("year-", "Year ");

export function PortalMaterialsClient({ role, materials }: PortalMaterialsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjectOptions[0].slug);
  const [selectedYear, setSelectedYear] = useState(subjectOptions[0].years[0]);
  const selectedSubjectConfig = subjectOptions.find((subject) => subject.slug === selectedSubject) ?? subjectOptions[0];

  useEffect(() => {
    const firstYear = selectedSubjectConfig.years[0];
    if (!selectedSubjectConfig.years.includes(selectedYear)) {
      setSelectedYear(firstYear);
    }
  }, [selectedSubjectConfig, selectedYear]);

  const getSubjectMatches = (materialSubject: string, subjectSlug: string) => {
    const config = subjectOptions.find((subject) => subject.slug === subjectSlug);
    if (!config) return false;

    const normalized = materialSubject.trim().toLowerCase();
    return config.aliases.some((alias) => normalized.includes(alias));
  };

  const subjectMaterialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const subject of subjectOptions) {
      counts[subject.slug] = materials.filter((material) =>
        getSubjectMatches(material.subject, subject.slug)
      ).length;
    }
    return counts;
  }, [materials]);

  const subjectMaterials = useMemo(
    () => materials.filter((material) => getSubjectMatches(material.subject, selectedSubject)),
    [materials, selectedSubject]
  );

  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subjectMaterials;

    return subjectMaterials.filter((material) =>
      [material.title, material.subject, material.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [subjectMaterials, searchQuery]);

  const cardRole = role === "teacher" ? "teacher" : "student";
  const isScienceYear7 = selectedSubject === "science" && selectedYear === "year-7";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        {role === "admin" ? (
          <AdminSidebar activeSection="materials" />
        ) : (
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
                Choose subject first, then year level, then open materials.
              </p>
            </div>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">Step 1</Badge>
                <span className="text-muted-foreground">Choose subject</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">Step 2</Badge>
                <span className="text-muted-foreground">Choose year</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">Step 3</Badge>
                <span className="text-muted-foreground">Get materials</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {subjectOptions.map((subject) => {
                  const isActive = subject.slug === selectedSubject;
                  return (
                    <button
                      key={subject.slug}
                      type="button"
                      onClick={() => setSelectedSubject(subject.slug)}
                      className={cn(
                        "text-left rounded-2xl border bg-white p-5 transition-all hover:shadow-sm",
                        isActive ? "border-primary ring-2 ring-primary/20" : "border-slate-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          {subject.slug === "science" ? (
                            <FlaskConical className="w-5 h-5" />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                        </div>
                        <Badge variant="secondary">{subjectMaterialCounts[subject.slug] ?? 0} materials</Badge>
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-slate-900">{subject.label}</h3>
                      <p className="mt-1 text-sm text-slate-600">{subject.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>{selectedSubjectConfig.label}: Year Selection</CardTitle>
                <CardDescription>Select a year level to load the relevant materials.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {selectedSubjectConfig.years.map((year) => (
                  <Button
                    key={year}
                    type="button"
                    variant={year === selectedYear ? "default" : "outline"}
                    onClick={() => setSelectedYear(year)}
                  >
                    {yearLabel(year)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {isScienceYear7 && (
              <Card className="border-sky-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_55%),linear-gradient(to_bottom_right,_#ffffff,_#f8fbff)]">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-slate-900">Year 7 Science Chapters</CardTitle>
                      <CardDescription>
                        Chapter-based structure is ready. Select chapters below.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{year7ScienceChapters.length} chapters</Badge>
                      <Badge variant="secondary">{YEAR7_SCIENCE_TOTAL_LESSONS} lessons</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {year7ScienceChapters.map((chapter) => (
                      <Card key={chapter.slug} className="border-slate-200">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Chapter {chapter.order}
                          </p>
                          <p className="font-semibold text-slate-900 leading-tight">{chapter.shortTitle}</p>
                          <p className="text-xs text-slate-600">{chapter.weekRange}</p>
                          <p className="text-xs text-slate-500">{chapter.lessons.length} lessons</p>
                          <Button asChild size="sm" className="w-full mt-2">
                            <Link href={`/${role}/materials/year-7/science/${chapter.slug}`}>
                              Open Chapter
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedSubjectConfig.label} Materials for {yearLabel(selectedYear)}
                </CardTitle>
                <CardDescription>
                  All published materials in this portal for the selected subject.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={`Search ${selectedSubjectConfig.label.toLowerCase()} materials...`}
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
                      Try another subject, year, or search keyword.
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
