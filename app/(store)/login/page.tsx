"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) setError(signUpError.message);
      else {
        alert("Success! Please check your email to verify your account, then log in.");
        setIsSignUp(false);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) setError(signInError.message);
      else router.push('/account');
    }
    
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col justify-center items-center pb-24">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-inner">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-white tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-400 mt-2 text-center text-sm">
            {isSignUp ? 'Sign up to access your past purchases and downloads.' : 'Sign in to access your digital downloads & library.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full h-13 bg-white/5 border border-white/10 hover:border-white/25 text-white font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
          <div className="flex-1 h-px bg-white/10" />
          <span>or with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/40 transition-colors text-sm"
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
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/40 transition-colors text-sm"
              required
            />
          </div>
          <button 
            disabled={loading || googleLoading}
            className="w-full h-12 mt-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In with Email"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="text-white hover:underline font-medium ml-1"
          >
            {isSignUp ? "Sign In" : "Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

