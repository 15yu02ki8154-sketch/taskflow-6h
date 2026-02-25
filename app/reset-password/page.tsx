"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const supabase = createClient();

  const updatePassword = async () => {
    setLoading(true);
    setMsg(null);
    setIsError(false);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setIsError(true);
      return setMsg(error.message);
    }
    setMsg("パスワードを更新しました。");
    setTimeout(() => {
      router.push("/projects");
    }, 1500);
  };

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>パスワード再設定</h1>

      <label style={{ display: "block", marginBottom: 8 }}>新しいパスワード</label>
      <input
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        type="password"
        style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ddd", borderRadius: 8 }}
        placeholder="新しいパスワードを入力"
      />

      <button
        onClick={updatePassword}
        disabled={loading || !newPassword}
        style={{ 
          width: "100%", 
          padding: 10, 
          borderRadius: 8, 
          border: "1px solid #ddd",
          cursor: loading || !newPassword ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "更新中..." : "パスワードを更新"}
      </button>

      {msg && <p style={{ marginTop: 12, color: isError ? "red" : "green" }}>{msg}</p>}
    </main>
  );
}
