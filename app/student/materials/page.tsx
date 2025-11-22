// Server component - fetches materials from Firestore
import { getMaterials } from "@/lib/firestore-services";
import MaterialsClient from "./materials-client";

export default async function StudentMaterialsPage() {
    // Fetch materials from Firestore
    const materials = await getMaterials();

    // Pass to client component
    return <MaterialsClient materials={materials} />;
}
