"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPane } from "@/components/workspace/preview-pane";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import type { ComposerMode } from "@/components/site/prompt-composer";
import { useStopSandboxOnLeave } from "@/lib/hooks/use-stop-sandbox-on-leave";
import type { WorkspaceProject } from "@/lib/types/user";

export function Workspace({
  projectId,
  initialMode,
}: {
  projectId: string;
  initialMode?: ComposerMode;
}) {
  const project = useQuery(api.projects.get, {
    projectId: asProjectId(projectId),
  }) as WorkspaceProject | null | undefined;

  const busy =
    project?.status === "provisioning" ||
    project?.status === "generating" ||
    project?.publishStatus === "publishing";

  useStopSandboxOnLeave(projectId, project?.boxId, { enabled: !busy });

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <WorkspaceHeader projectId={projectId} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-border/60 lg:w-[440px] lg:border-b-0 lg:border-r">
          <ChatPanel
            projectId={projectId}
            project={project}
            busy={busy ?? false}
            defaultMode={initialMode ?? "build"}
          />
        </aside>
        <section className="min-h-0 flex-1">
          <PreviewPane
            projectId={projectId}
            status={project?.status}
            previewUrl={project?.previewUrl}
            boxId={project?.boxId}
          />
        </section>
      </div>
    </div>
  );
}
