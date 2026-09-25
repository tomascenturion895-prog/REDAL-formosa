import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { safeNextPath } from "@/lib/auth/messages";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDesc = requestUrl.searchParams.get("error_description");

  // Resolver el origen respetando proxies inversos (ej. Vercel, Coolify, Nginx)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const origin = isLocalEnv
    ? requestUrl.origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : requestUrl.origin;

  // Si el proveedor OAuth devolvió un error (ej. el usuario canceló el inicio de sesión)
  if (oauthError) {
    const errorParam = encodeURIComponent(oauthErrorDesc || oauthError);
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // Contexto de sólo lectura
              }
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Sincronizar metadatos del proveedor (Google, Facebook, X) con la tabla profiles
      if (data?.user) {
        const user = data.user;
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.user_name;
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture;

        if (fullName || avatarUrl) {
          try {
            await supabase
              .from("profiles")
              .update({
                ...(fullName ? { full_name: fullName } : {}),
                ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
              })
              .eq("id", user.id);
          } catch (profileError) {
            // Error no fatal: el login sigue siendo válido
            console.error("[OAuth Profile Sync Error]", profileError);
          }
        }
      }

      return response;
    }

    console.error("[OAuth Code Exchange Error]", exchangeError);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  // Si no se proporcionó ni código ni error
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
