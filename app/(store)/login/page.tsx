"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Customers do not need accounts; redirect to store
    router.replace('/store');
  }, [router]);

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm">Redirecting to store...</p>
    </div>
  );
}
