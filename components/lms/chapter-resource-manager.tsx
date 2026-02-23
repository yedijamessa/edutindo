"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Link2, Plus, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ChapterResourceType = "pdf" | "video" | "document" | "link" | "other";

type ChapterResource = {
  id: string;
  chapterSlug: string;
  subject: string;
  yearLevel: number;
  title: string;
  resourceType: ChapterResourceType;
  url: string;
  description: string;
  createdByEmail: string;
  createdAt: string;
};

interface ChapterResourceManagerProps {
  chapterSlug: string;
  subject: string;
  yearLevel: number;
  canManage: boolean;
}

const resourceTypeLabels: Record<ChapterResourceType, string> = {
  pdf: "PDF",
  video: "Video",
  document: "Document",
  link: "Link",
  other: "Other",
};

function formatResourceDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function typeIcon(type: ChapterResourceType) {
  if (type === "pdf" || type === "document") return <FileText className="w-4 h-4" />;
  if (type === "video") return <Video className="w-4 h-4" />;
  return <Link2 className="w-4 h-4" />;
}

export function ChapterResourceManager({
  chapterSlug,
  subject,
  yearLevel,
  canManage,
}: ChapterResourceManagerProps) {
  const [resources, setResources] = useState<ChapterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ChapterResourceType>("pdf");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const endpoint = useMemo(
    () =>
      `/api/materials/chapter-resources?chapterSlug=${encodeURIComponent(chapterSlug)}&subject=${encodeURIComponent(
        subject
      )}&yearLevel=${encodeURIComponent(String(yearLevel))}`,
    [chapterSlug, subject, yearLevel]
  );

  const loadResources = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to load resources.");
        setResources([]);
        return;
      }

      setResources(Array.isArray(data.resources) ? data.resources : []);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load resources.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [endpoint]);

  const resetForm = () => {
    setTitle("");
    setResourceType("pdf");
    setUrl("");
    setDescription("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/materials/chapter-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug,
          subject,
          yearLevel,
          title,
          resourceType,
          url,
          description,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to add resource.");
        return;
      }

      setMessage("Resource added.");
      resetForm();
      await loadResources();
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to add resource.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter Resources</CardTitle>
        <CardDescription>
          {canManage
            ? "Add PDF/video/material links for students. These links appear immediately in this chapter."
            : "Resources shared by your teacher, principal, or admin for this chapter."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {canManage && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource title</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g., Lesson Slides Week 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={resourceType}
                  onChange={(event) => setResourceType(event.target.value as ChapterResourceType)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short note for students."
                rows={2}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving}>
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Adding..." : "Add Resource"}
              </Button>
              {message && <span className="text-sm text-green-700">{message}</span>}
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </form>
        )}

        {!canManage && error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            No resources yet for this chapter.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {resources.map((resource) => (
              <div key={resource.id} className="rounded-xl border bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{resource.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="secondary">{resourceTypeLabels[resource.resourceType]}</Badge>
                      <span>{formatResourceDate(resource.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-slate-500">{typeIcon(resource.resourceType)}</div>
                </div>

                {resource.description && <p className="text-sm text-slate-600">{resource.description}</p>}

                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 truncate">
                    {resource.createdByEmail ? `Added by ${resource.createdByEmail}` : "Added by teacher/admin"}
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                      Open
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
