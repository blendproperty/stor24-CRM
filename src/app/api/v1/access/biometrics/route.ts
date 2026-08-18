import { apiError } from "@/lib/api";
import { enrollBiometricAccess, listBiometricAccess, revokeBiometricAccess } from "@/lib/biometric-access-service";
import { requirePermissionScope } from "@/lib/scope";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({ data: await listBiometricAccess(await requirePermissionScope("access.view")) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("faceImage");
    if (!(image instanceof File)) return Response.json({ error: { code: "FACE_IMAGE_REQUIRED", message: "Choose a clear JPEG or PNG facial photograph." } }, { status: 422 });
    const facilityId = String(form.get("facilityId") ?? "");
    const data = await enrollBiometricAccess(await requirePermissionScope("access.manage", facilityId), {
      facilityId,
      customerId: String(form.get("customerId") ?? ""),
      occupancyId: String(form.get("occupancyId") ?? ""),
      consent: form.get("consent") === "true",
      image,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (["BIOMETRIC_CONSENT_REQUIRED", "FACE_IMAGE_TYPE_INVALID", "FACE_IMAGE_SIZE_INVALID", "ACTIVE_OCCUPANCY_REQUIRED"].includes(code)) {
      return Response.json({ error: { code, message: "The biometric enrolment details are incomplete or invalid." } }, { status: 422 });
    }
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { enrollmentId } = await request.json() as { enrollmentId?: string };
    if (!enrollmentId) return Response.json({ error: { code: "VALIDATION_ERROR", message: "An enrolment is required." } }, { status: 422 });
    return Response.json({ data: await revokeBiometricAccess(await requirePermissionScope("access.manage"), enrollmentId) });
  } catch (error) { return apiError(error); }
}
