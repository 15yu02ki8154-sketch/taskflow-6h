import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // /auth/callback は常に通す（メール確認用）
  if (pathname.startsWith("/auth/callback")) return response;

  // ログイン済みで /login にアクセスしたら /projects にリダイレクト
  if (pathname.startsWith("/login") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/projects";
    return NextResponse.redirect(url);
  }

  // ログインページは通す（未ログインの場合）
  if (pathname.startsWith("/login")) return response;

  // /projects はログイン必須
  if (pathname.startsWith("/projects") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/auth/callback/:path*", "/projects/:path*", "/login"],
};