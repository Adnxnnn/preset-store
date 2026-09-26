"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Enforce exclusive admin credentials
    if (cleanEmail !== "admin@presetstore.com" || cleanPassword !== "Admin12345!") {
      setError("Invalid credentials. Access is restricted exclusively to authorized admin credentials.");
      setLoading(false);
      return;
    }

    // Set authorized master admin session immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("luma_admin_auth", "true");
      localStorage.setItem("luma_admin_email", cleanEmail);
    }

    try {
      // Background sync with Supabase (non-blocking)
      supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      }).catch(() => {});
    } catch (_) {}

    // Immediate access
    router.push("/admin");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-serif text-white">Admin Portal</h1>
          <p className="text-gray-400 text-xs mt-1">Sign in with master store credentials.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@presetstore.com"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 text-sm"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full h-12 mt-4 bg-white text-black font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? "Authenticating..." : "Access Admin Studio"}
          </button>
        </form>
      </div>
    </div>
  );
}

