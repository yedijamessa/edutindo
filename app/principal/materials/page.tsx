import { PortalMaterialsClient } from "@/components/lms/portal-materials-client";
import { getMaterials } from "@/lib/db-services";

export default async function PrincipalMaterialsPage() {
  const materials = await getMaterials();
  return <PortalMaterialsClient role="principal" materials={materials} />;
}
