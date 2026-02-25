"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const supabase = createClient();

  const signUp = async () => {
    setLoading(true);
    setMsg(null);
    setIsError(false);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setLoading(false);
    if (error) {
      setIsError(true);
      return setMsg(error.message);
    }
    setMsg("サインアップOK。確認メールが来る場合があります。");
  };

  const resetPassword = async () => {
    setLoading(true);
    setMsg(null);
    setIsError(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    });
    setLoading(false);
    if (error) {
      setIsError(true);
      return setMsg(error.message);
    }
    setMsg("パスワード再設定メールを送信しました。");
  };

  const signIn = async () => {
    console.log("signIn function called");
    setLoading(true);
    setMsg(null);
    setIsError(false);
    console.log("About to call signInWithPassword with:", { email, password: "***" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("signInWithPassword completed, error:", error);
    setLoading(false);
    if (error) {
      setIsError(true);
      return setMsg(error.message);
    }
    router.replace("/projects");
    router.refresh();
  };

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Login</h1>

      <label style={{ display: "block", marginBottom: 8 }}>Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ddd", borderRadius: 8 }}
        placeholder="you@example.com"
      />

      <label style={{ display: "block", marginBottom: 8 }}>Password</label>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ddd", borderRadius: 8 }}
        placeholder="********"
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={signIn}
          disabled={loading}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        >
          Sign in
        </button>
        <button
          onClick={signUp}
          disabled={loading}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        >
          Sign up
        </button>
      </div>

      {msg && <p style={{ marginTop: 12, color: isError ? "red" : "green" }}>{msg}</p>}
      
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          onClick={resetPassword}
          disabled={loading || !email}
          style={{ 
            padding: "8px 16px", 
            borderRadius: 6, 
            border: "1px solid #ddd", 
            backgroundColor: "transparent",
            cursor: loading || !email ? "not-allowed" : "pointer",
            fontSize: 14
          }}
        >
          パスワードを忘れた
        </button>
      </div>
    </main>
  );
}