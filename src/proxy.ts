import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

const publicPagePrefixes = ["/login", "/invite/", "/setup/"];
const publicApiPrefixes = ["/api/health", "/api/auth/login", "/api/auth/setup", "/api/v1/invitations/accept"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    publicPagePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix)) ||
    publicApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
  const session = await verifySessionToken(request.cookies.get(sessionCookieName)?.value);

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isPublic) return NextResponse.next();
  if (!session && pathname.startsWith("/api/")) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Please sign in." } }, { status: 401 });
  }
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
