import { AdminMaterialsCatalog } from "@/components/admin/admin-materials-catalog";
import { listSchoolModuleCatalog } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const schools = await listSchoolModuleCatalog();

  return <AdminMaterialsCatalog schools={schools} />;
}
