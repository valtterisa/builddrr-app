"use client";

import * as React from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig, puckOverrides } from "@/components/editor/puck-config";

export function EditClient({
  previewId,
  onPublish,
  data,
}: {
  previewId: string;
  onPublish: (previewId: string, json: any) => Promise<void>;
  data: any;
}) {
  const [saving, setSaving] = React.useState(false);

  async function handlePublish(json: any) {
    setSaving(true);
    await onPublish(previewId, json);
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <Puck
        config={puckConfig as any}
        data={data}
        onPublish={handlePublish}
        overrides={puckOverrides}
      />
    </div>
  );
}
