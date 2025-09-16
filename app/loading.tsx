import React from "react";
import LoadingUI from "@/components/loading-ui";

export default function Loading() {
  return (
    <div className="h-dvh bg-white">
      <LoadingUI
        message="Getting things ready..."
        submessage="This will only take a moment"
      />
    </div>
  );
}
