import { AdminMaterialsCatalog } from "@/components/admin/admin-materials-catalog";
import { listModuleCatalog } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const subjects = await listModuleCatalog();

  return <AdminMaterialsCatalog subjects={subjects} />;
}
