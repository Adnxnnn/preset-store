"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Try Supabase Auth Sign-In
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (data?.session) {
        if (typeof window !== "undefined") {
          localStorage.setItem("luma_admin_email", cleanEmail);
          localStorage.setItem("luma_admin_auth", "true");
        }
        router.replace("/admin");
        return;
      }

      // 2. If user doesn't exist in Supabase yet, attempt initial Admin user creation
      if (signInErr && signInErr.message.toLowerCase().includes("invalid login credentials")) {
        // Check if master default credentials match
        if (cleanEmail === "admin@presetstore.com" && cleanPassword === "Admin12345!") {
          if (typeof window !== "undefined") {
            localStorage.setItem("luma_admin_email", cleanEmail);
            localStorage.setItem("luma_admin_auth", "true");
          }
          // Also try creating the Supabase user in background for persistence
          await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
          }).catch(() => {});

          router.replace("/admin");
          return;
        }

        // Try signing up as admin in Supabase
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signUpData?.session) {
          if (typeof window !== "undefined") {
            localStorage.setItem("luma_admin_email", cleanEmail);
            localStorage.setItem("luma_admin_auth", "true");
          }
          router.replace("/admin");
          return;
        }

        if (signUpErr) {
          throw new Error("Invalid credentials. Please verify your admin password.");
        }
      } else if (signInErr) {
        throw signInErr;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("luma_admin_email", cleanEmail);
        localStorage.setItem("luma_admin_auth", "true");
      }
      router.replace("/admin");

    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err?.message || "Authentication failed. Access restricted to authorized admin credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleUseDefaultCredentials() {
    setEmail("admin@presetstore.com");
    setPassword("Admin12345!");
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/luma.png"
            alt="LUMA"
            className="h-9 w-auto object-contain mb-4"
          />
          <h1 className="text-2xl font-serif text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 text-xs mt-1">
            Restricted access for store administrators.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl mb-6 leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Admin Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@presetstore.com"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-4 pr-11 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 text-sm transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 bg-white text-black font-semibold text-sm rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Helper */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={handleUseDefaultCredentials}
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Fill Master Admin Credentials</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Return to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
