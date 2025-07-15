"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostOAuthPage() {
  const router = useRouter();

  useEffect(() => {
    async function goToCheckout() {
      const res = await fetch("/api/polar-checkout");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.replace("/error");
      }
    }
    goToCheckout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex items-center space-x-3">
        <svg
          className="animate-spin h-6 w-6 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <span className="text-lg font-medium">
          Redirecting you to Polar checkout...
        </span>
      </div>
      <p className="mt-4 text-gray-500">
        No payment required — this is a{" "}
        <span className="font-semibold text-green-600">free</span> plan.
      </p>
    </div>
  );
}
