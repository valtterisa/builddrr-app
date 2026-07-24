import { EmptyState } from "@/components/site/empty-state";
import { Section } from "@/components/site/section";
import { ProjectCard } from "@/components/dashboard/project-card";
import type { DashboardProject } from "@/components/dashboard/types";

export function ProjectGrid({
  projects,
}: {
  projects: DashboardProject[] | undefined;
}) {
  return (
    <Section
      flush
      className="border-b border-border"
      containerClassName="max-w-none px-0"
    >
      <div className="border-b border-border px-6 py-4 md:px-8">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Your sites
        </h2>
      </div>

      {projects === undefined ? (
        <div className="border-b border-border px-6 py-10 md:px-8">
          <EmptyState title="Loading…" />
        </div>
      ) : projects.length === 0 ? (
        <div className="border-b border-border px-6 py-10 md:px-8">
          <EmptyState
            title="No sites yet"
            description="Your first generation will show up here."
          />
        </div>
      ) : (
        <div className="grid border-l border-border sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              className="border-b border-r border-border"
            />
          ))}
        </div>
      )}
    </Section>
  );
}
