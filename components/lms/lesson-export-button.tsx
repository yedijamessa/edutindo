"use client";

import { useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LessonExportButtonProps {
  exportPath: string;
  lessonTitle: string;
  buttonLabel?: string;
  compact?: boolean;
}

export function LessonExportButton({
  exportPath,
  lessonTitle,
  buttonLabel = "Export",
  compact = false,
}: LessonExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size={compact ? "sm" : "default"} onClick={() => setOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Export Lesson</DialogTitle>
            <DialogDescription>
              Choose how you want to export <strong>{lessonTitle}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Button
              type="button"
              className="justify-start"
              onClick={() => {
                setOpen(false);
                window.open(`${exportPath}?format=pdf`, "_blank", "noopener,noreferrer");
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>

            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => {
                setOpen(false);
                window.location.assign(`${exportPath}?format=word`);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as Word
            </Button>
          </div>

          <p className="text-sm text-slate-500">
            PDF opens a print-ready view. Word downloads as a `.doc` file.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
