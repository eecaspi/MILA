import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/** Set when someone arrives through a personal invitation link (/?for=NAME or /?invite=1). */
const GUEST_COOKIE = "liky-guest";

const OPEN_PREFIXES = [
  "/login",
  "/auth",
  "/admin",
  "/api",
  "/contract",
  "/reset-password",
  "/coming-soon",
  "/terms",
  "/privacy",
  "/accessibility",
  "/report-problem",
  "/manifest",
  "/robots",
  "/sitemap",
  "/icon",
  "/sw.js",
  "/brand",
];

function isOpenPath(pathname: string) {
  return OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}.`));
}

/** Refreshes the Supabase auth session cookie on every request. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching auth triggers the refresh. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!siteConfig.features.publicSite && !isOpenPath(request.nextUrl.pathname)) {
    const q = request.nextUrl.searchParams;
    const invite = q.has("for") || (q.has("invite") && q.get("invite") !== "off");
    if (invite) {
      response.cookies.set(GUEST_COOKIE, "1", {
        path: "/",
        maxAge: 60 * 60 * 3,
        httpOnly: true,
        sameSite: "lax",
        secure: true,
      });
      return response;
    }
    if (request.cookies.get(GUEST_COOKIE)?.value === "1") return response;
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      isAdmin = profile?.role === "admin";
    }
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      url.search = "";
      const blocked = NextResponse.rewrite(url, { status: 503, headers: { "Retry-After": "86400" } });
      response.cookies.getAll().forEach((c) => blocked.cookies.set(c));
      return blocked;
    }
  }

  return response;
}
