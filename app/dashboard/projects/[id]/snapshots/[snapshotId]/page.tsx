import { notFound } from "next/navigation";
import Link from "next/link";
import PackageRow from "@/components/package-row";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProject } from "@/app/actions/projects";
import { getLatestSnapshot, getSnapshot } from "@/app/actions/snapshots";
import { getPackages } from "@/app/actions/reviews";

export default async function SnapshotPage({ params }: { params: Promise<{ id: string; snapshotId: string }> }) {
  const { id, snapshotId } = await params;

  const project = await getProject(id);
  if (!project) notFound();

  const snapshot = await getSnapshot(snapshotId, project.id);
  if (!snapshot) notFound();

  const latest = await getLatestSnapshot(project.id);

  const isLatest = latest.id === snapshot.id;

  const packages = await getPackages(snapshot.id);
  const pending = packages.filter((p) => p.status === "pending");
  const reviewed = packages.filter((p) => p.status !== "pending");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/dashboard/projects/${project.id}/snapshots`}
            className="text-xs text-zinc-400 hover:text-zinc-600 mb-1 block"
          >
            ← Snapshot history
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {new Date(snapshot.captured_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h1>
            {isLatest && (
              <Badge variant="outline" className="text-xs text-zinc-400">
                latest
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {project.repo_owner}/{project.repo_name}
            {" · "}
            {new Date(snapshot.captured_at).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {packages.length === 0 ? (
        <div className="border border-dashed border-zinc-300 rounded-xl py-16 text-center">
          <p className="text-sm text-zinc-400">All dependencies were up to date</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                Needs review · {pending.length}
              </p>
              <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white overflow-hidden">
                {pending.map((pkg) => (
                  <PackageRow key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                Reviewed · {reviewed.length}
              </p>
              <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white overflow-hidden opacity-60">
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
