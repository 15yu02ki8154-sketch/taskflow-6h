"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const hash = window.location.hash;
      
      // ハッシュからトークンを取得（recoveryメール優先）
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          if (!error) {
            if (type === "recovery") {
              router.replace("/reset-password");
              return;
            }
            router.replace("/projects");
            return;
          }
        }
      }

      // 検索パラメータからコードを取得（通常ログイン用）
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
          router.replace("/projects");
          return;
        }
      }

      // エラーの場合は画面に表示（すぐにリダイレクトしない）
      setLoading(false);
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 16, textAlign: "center" }}>
      <p>認証処理中...</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackClient />
    </Suspense>
  );
}
