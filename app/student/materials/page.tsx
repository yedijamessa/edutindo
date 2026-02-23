import { getMaterials } from "@/lib/db-services";
import { PortalMaterialsClient } from "@/components/lms/portal-materials-client";

export default async function StudentMaterialsPage() {
    const materials = await getMaterials();

    return <PortalMaterialsClient role="student" materials={materials} />;
}
