import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const subdomain = request.headers.get("x-subdomain");
  const url = request.nextUrl.clone();

  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot|json)$/.test(
      url.pathname
    )
  ) {
    return NextResponse.next();
  }

  if (subdomain === "admin") {
    url.pathname = `/admin${url.pathname}`;
  } else if (subdomain === "crm") {
    url.pathname = `/crm${url.pathname}`;
  }

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next).*)"],
};
