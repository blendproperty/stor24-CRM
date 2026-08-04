export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR";
  const status = message === "UNAUTHENTICATED" ? 401 : message.includes("FORBIDDEN") ? 403 : message === "NOT_FOUND" ? 404 : message === "CONFLICT" ? 409 : 500;
  return Response.json({ error: { code: message, message: status === 500 ? "The request could not be completed." : message } }, { status });
}

export async function jsonBody(request: Request) {
  try { return await request.json(); } catch { throw new Error("INVALID_JSON"); }
}
