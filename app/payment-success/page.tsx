"use client";

import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const orderId =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("order_id");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/payment/order/${encodeURIComponent(orderId)}`)
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error);
        setMessage(
          data.orderStatus === "PAID"
            ? "Payment successful. Thank you for your purchase!"
            : `Your payment is ${String(data.orderStatus).toLowerCase()}.`
        );
      })
      .catch(() =>
        setMessage(
          "We could not verify your payment. Please contact support with your order ID."
        )
      );
  }, [orderId]);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Payment status</h1>
        <p className="mt-4 text-gray-600">
          {orderId ? message : "We could not find your order."}
        </p>
      </section>
    </main>
  );
}
