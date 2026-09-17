import { updateSession } from "@/lib/supabase/middleware";
import { checkRole } from "@/lib/checkRole";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    return response;
  }

  if (!pathname.startsWith("/admin")) {
    return response;
  }

  const role = await checkRole(request);

  if (!role) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  const isAdmin = role === "Admin";
  const isEditor = role === "Editor";
  const isReporter = role === "Reporter";

  // Admin only
  if (
    pathname.startsWith("/admin/staff") ||
    pathname.startsWith("/admin/advertisements") ||
    pathname.startsWith("/admin/settings")
  ) {
    if (!isAdmin) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Admin + Editor
  if (pathname.startsWith("/admin/analytics")) {
    if (!isAdmin && !isEditor) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // All News = Admin + Editor
  if (pathname === "/admin/articles") {
    if (!isAdmin && !isEditor) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Add News = Admin + Editor + Reporter
  if (pathname.startsWith("/admin/articles/new")) {
    if (!isAdmin && !isEditor && !isReporter) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Edit News = Admin + Editor
  if (pathname.startsWith("/admin/articles/edit")) {
    if (!isAdmin && !isEditor) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Preview = Admin + Editor
  if (pathname.startsWith("/admin/articles/preview")) {
    if (!isAdmin && !isEditor) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Breaking News = Admin + Editor
  if (pathname.startsWith("/admin/breaking-news")) {
    if (!isAdmin && !isEditor) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
