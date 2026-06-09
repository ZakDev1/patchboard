import { notFound } from "next/navigation";
import SyncButton from "@/components/buttons/sync";
import PackageRow from "@/components/package-row";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteProjectButton from "@/components/buttons/delete-project";
import OpenPRButton from "@/components/buttons/open-pr";
import { getProject } from "@/app/actions/projects";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import { getPackages } from "@/app/actions/reviews";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const snapshot = await getLatestSnapshot(id);
  const packages = snapshot ? await getPackages(snapshot.id) : [];

  const pending = packages.filter((p) => p.status === "pending");
  const reviewed = packages.filter((p) => p.status !== "pending");
  const approvedWithoutPR = packages.filter(
    (p) => p.status === "approved" && !p.prUrl,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">
            <span className="text-muted-foreground">{project.repoOwner}/</span>
            {project.repoName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {snapshot
              ? `Last synced ${new Date(snapshot.capturedAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}`
              : "Never synced"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteProjectButton projectId={id} />
          <OpenPRButton
            projectId={id}
            approvedCount={approvedWithoutPR.length}
          />
          <Link href={`/dashboard/projects/${id}/snapshots`}>
            <Button size="sm" variant="outline">
              History
            </Button>
          </Link>
          <SyncButton projectId={project.id} />
        </div>
      </div>

      <Separator className="mb-6" />

      {packages.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {snapshot
              ? "All dependencies are up to date"
              : "No snapshot yet - hit Sync to scan your dependencies"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Needs review · {pending.length}
              </p>
              <div className="border border-border rounded-xl divide-y divide-border bg-card overflow-hidden">
                {pending.map((pkg) => (
                  <PackageRow key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Reviewed · {reviewed.length}
              </p>
              <div className="border border-border rounded-xl divide-y divide-border bg-card overflow-hidden opacity-60">
                {reviewed.map((pkg) => (
                  <PackageRow key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
