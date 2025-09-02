"use client";

import React from "react";
import Logo from "@/components/logo";

type LoadingUIProps = {
  message?: string;
  submessage?: string;
  className?: string;
};

export default function LoadingUI({
  message = "Loading...",
  submessage,
  className,
}: LoadingUIProps) {
  return (
    <div
      className={`flex items-center justify-center h-full ${className || ""}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <Logo className="h-12 w-12 text-black dark:text-white opacity-80 animate-pulse" />
          <div className="absolute inset-0 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>
        <div className="text-center">
          <p className="text-sm text-black dark:text-white font-medium">
            {message}
          </p>
          {submessage ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {submessage}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
