import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
 
    if (!session) {
        // Return JSON response for API routes
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401},
            );
        }      
        // Page redirect for non API routes
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
 
    return NextResponse.next();
}
 
export const config = {
  	runtime: "nodejs",
	matcher: [
        "/pages/transactions/:path*",
        "/pages/categories/:path*",
        "/pages/accounts/:path*",
        "/api/((?!auth).*)"
	]
};