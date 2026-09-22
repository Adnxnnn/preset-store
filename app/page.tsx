"use client";

import { useState } from "react";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self";
      }) => void;
    };
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);

  const buyPreset = async () => {
    try {
      setLoading(true);

      // Create Cashfree order on our server
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: {
        success: boolean;
        error?: string;
        paymentSessionId?: string;
        environment?: "sandbox" | "production";
      } = await response.json();

      if (!response.ok || !data.success || !data.paymentSessionId || !data.environment) {
        throw new Error(data.error || "Unable to create order");
      }

      const { paymentSessionId, environment } = data;

      // Load Cashfree JavaScript SDK
      const existingScript = document.querySelector(
        'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
      );

      const startCheckout = () => {
        const CashfreeCheckout = window.Cashfree;
        if (!CashfreeCheckout) {
          throw new Error("Cashfree Checkout did not initialize");
        }

        const cashfree = CashfreeCheckout({
          mode: environment,
        });

        cashfree.checkout({
          paymentSessionId,
          redirectTarget: "_self",
        });
      };

      if (existingScript) {
        startCheckout();
        return;
      }

      const script = document.createElement("script");

      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;

      script.onload = () => {
        startCheckout();
      };

      script.onerror = () => {
        alert("Unable to load Cashfree Checkout.");
        setLoading(false);
      };

      document.body.appendChild(script);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-black flex items-center justify-center">
            <span className="text-white text-3xl">LR</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Premium Lightroom Preset
        </h1>

        <p className="mt-3 text-gray-600">
          Give your photos a professional look with our
          premium Lightroom preset.
        </p>

        <div className="mt-6">
          <span className="text-4xl font-bold text-gray-900">
            ₹499
          </span>
        </div>

        <button
          onClick={buyPreset}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-black px-6 py-4 text-white font-semibold hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Opening Checkout..." : "Buy Now — ₹499"}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          Secure payment powered by Cashfree
        </p>
      </div>
    </main>
  );
}
