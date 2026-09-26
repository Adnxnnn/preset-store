"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col justify-center items-center pb-24">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <h1 className="text-3xl font-serif text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-400 mt-2 text-center">
            {isSignUp ? 'Sign up to access your past purchases and downloads.' : 'Sign in to access your digital downloads.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-white/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-white/30"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full h-14 mt-4 bg-white text-black font-medium text-lg rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="text-white hover:underline font-medium"
          >
            {isSignUp ? "Sign In" : "Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
