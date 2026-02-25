"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Project {
  id: string;
  name: string;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,created_at")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "プロジェクトの取得に失敗しました");
    }
  };

  const addProject = async () => {
    if (!name.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from("projects")
        .insert({ user_id: user.id, name: name.trim() });
      
      if (error) throw error;
      
      setName("");
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "プロジェクトの追加に失敗しました");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "プロジェクトの削除に失敗しました");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await fetchProjects();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "初期化に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: "60px auto", padding: 16 }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: "60px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Projects</h1>
        <button
          onClick={handleLogout}
          style={{ 
            padding: "10px 20px", 
            borderRadius: 8, 
            border: "1px solid #ddd", 
            backgroundColor: "#f5f5f5",
            cursor: "pointer"
          }}
        >
          ログアウト
        </button>
      </div>
      
      {user && (
        <div style={{ marginBottom: 24 }}>
          <p>ようこそ、{user.email}さん</p>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: 4 }}>
          <p style={{ color: "#c00", margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addProject()}
            placeholder="プロジェクト名を入力"
            style={{ 
              flex: 1, 
              padding: 10, 
              border: "1px solid #ddd", 
              borderRadius: 8 
            }}
          />
          <button
            onClick={addProject}
            disabled={!name.trim()}
            style={{ 
              padding: "10px 20px", 
              borderRadius: 8, 
              border: "1px solid #ddd", 
              backgroundColor: name.trim() ? "#007bff" : "#f5f5f5",
              color: name.trim() ? "white" : "#666",
              cursor: name.trim() ? "pointer" : "not-allowed"
            }}
          >
            追加
          </button>
        </div>
      </div>

      <div>
        {projects.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#666", backgroundColor: "#f9f9f9", borderRadius: 8 }}>
            まだプロジェクトがありません
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{ 
                  padding: 16, 
                  border: "1px solid #ddd", 
                  borderRadius: 8, 
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: 16 }}>{project.name}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                    {new Date(project.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <button
                  onClick={() => deleteProject(project.id)}
                  style={{ 
                    padding: "6px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #dc3545", 
                    backgroundColor: "#dc3545",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 12
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
