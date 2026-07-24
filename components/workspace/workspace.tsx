"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPane } from "@/components/workspace/preview-pane";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import type { ComposerMode } from "@/components/site/prompt-composer";
import { useStopSandboxOnLeave } from "@/lib/hooks/use-stop-sandbox-on-leave";
import type { DomainStatus, PublishStatus } from "@/lib/publish/types";

interface Project {
  _id: string;
  name: string;
  status: string;
  previewUrl?: string;
  boxId?: string;
  error?: string;
  publishStatus?: PublishStatus;
  publishedUrl?: string;
  publishError?: string;
  cfSubdomain?: string;
  customDomain?: string;
  customDomainStatus?: DomainStatus;
}

export function Workspace({
  projectId,
  initialMode,
}: {
  projectId: string;
  initialMode?: ComposerMode;
}) {
  const project = useQuery((api as any).projects.get, { projectId }) as
    | Project
    | null
    | undefined;

  useStopSandboxOnLeave(projectId, project?.boxId);

  const busy =
    project?.status === "provisioning" || project?.status === "generating";

  const defaultMode: ComposerMode = initialMode ?? "build";

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <WorkspaceHeader
        projectId={projectId}
        name={project?.name}
        boxId={project?.boxId}
        publishStatus={project?.publishStatus ?? "idle"}
        publishedUrl={project?.publishedUrl}
        publishError={project?.publishError}
        cfSubdomain={project?.cfSubdomain}
        customDomain={project?.customDomain}
        customDomainStatus={project?.customDomainStatus}
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-border/60 lg:w-[440px] lg:border-b-0 lg:border-r">
          <ChatPanel
            projectId={projectId}
            busy={busy ?? false}
            defaultMode={defaultMode}
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
