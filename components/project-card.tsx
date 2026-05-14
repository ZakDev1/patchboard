import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";

export default function ProjectCard({ project }: { project: Project }) {
  const lastSynced = project.last_synced
    ? new Date(project.last_synced).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="px-5 py-4 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium">
                <span className="text-zinc-400">{project.repo_owner}/</span>
                {project.repo_name}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lastSynced ? `Last synced ${lastSynced}` : "Never synced"}
                {" · "}
                {project.snapshot_count} snapshot{project.snapshot_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-zinc-400">
            →
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
