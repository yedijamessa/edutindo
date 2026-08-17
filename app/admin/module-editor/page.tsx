import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminModuleEditorPage() {
  redirect("/admin/materials");
}
