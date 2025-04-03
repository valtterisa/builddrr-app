"use client";

import type React from "react";

import { Editor } from "@/components/editor/editor";

export default function EditorPage() {
  return (
    <div className="flex flex-col h-screen">
      <Editor />
    </div>
  );
}
