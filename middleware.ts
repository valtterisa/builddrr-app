import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // // Check if the request is for a protected route
    // const isProtectedRoute =
    //   req.nextUrl.pathname.startsWith("/dashboard") ||
    //   req.nextUrl.pathname.startsWith("/website/editor") ||
    //   req.nextUrl.pathname.startsWith("/preview")

    // // Check if the request is for an auth route
    // const isAuthRoute =
    //   req.nextUrl.pathname.startsWith("/login") ||
    //   req.nextUrl.pathname.startsWith("/signup") ||
    //   req.nextUrl.pathname.startsWith("/forgot-password") ||
    //   req.nextUrl.pathname.startsWith("/reset-password")

    // // If accessing a protected route without a session, redirect to login
    // if (isProtectedRoute && !session) {
    //   const redirectUrl = new URL("/login", req.url)
    //   redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    //   return NextResponse.redirect(redirectUrl)
    // }

    // // If accessing an auth route with a session, redirect to dashboard
    // if (isAuthRoute && session) {
    //   return NextResponse.redirect(new URL("/dashboard", req.url));
    // }
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error with Supabase, we'll still allow the request to proceed
    // but log the error. This prevents the site from breaking if Supabase is down.
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/website/editor/:path*",
    "/preview/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
