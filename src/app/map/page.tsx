import { FacilityMapEditor } from "@/components/facility-map-editor";
import { requirePermission } from "@/lib/auth-guards";

export const metadata = { title: "Facility map" };

export default async function MapPage() {
  await requirePermission("facility_map.view");
  return <FacilityMapEditor/>;
}
