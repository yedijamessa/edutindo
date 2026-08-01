"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentAssignedModuleLesson } from "@/lib/module-editor";

interface LearningPathClientProps {
  assignedLessons: StudentAssignedModuleLesson[];
}

export default function LearningPathClient({ assignedLessons }: LearningPathClientProps) {
  const [filter, setFilter] = useState("all");
  const subjects = Array.from(new Set(assignedLessons.map((lesson) => lesson.subject).filter(Boolean)));
  const filteredLessons =
    filter === "all" ? assignedLessons : assignedLessons.filter((lesson) => lesson.subject === filter);

  return (
    <div className="portal-page-width space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-8 w-8 text-[#2f6fff]" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
          <p className="mt-1 text-slate-500">Lessons assigned directly to this student.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All Subjects
        </Button>
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={filter === subject ? "default" : "outline"}
            onClick={() => setFilter(subject)}
          >
            {subject}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{assignedLessons.length}</div>
              <p className="text-sm text-muted-foreground">Assigned Lessons</p>
            </div>
            <div>
              <div className="text-3xl font-bold">{subjects.length}</div>
              <p className="text-sm text-muted-foreground">Assigned Subjects</p>
            </div>
            <div>
              <div className="text-3xl font-bold">0%</div>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredLessons.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-2xl font-bold">Assigned Lessons</h2>
            <Badge variant="secondary">{filteredLessons.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="border-l-4 border-l-green-500 transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="mb-2">
                        {lesson.subject}
                      </Badge>
                      <CardTitle className="text-lg">{lesson.moduleTitle}</CardTitle>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                    </div>
                    <CheckCircle className="ml-2 h-5 w-5 flex-shrink-0 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={lesson.href}>
                      Continue Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assigned lessons found for this student.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
