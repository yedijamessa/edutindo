import { PortalMaterialsClient } from "@/components/lms/portal-materials-client";
import { getMaterials } from "@/lib/db-services";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const materials = await getMaterials();
  return <PortalMaterialsClient role="admin" materials={materials} />;
}
