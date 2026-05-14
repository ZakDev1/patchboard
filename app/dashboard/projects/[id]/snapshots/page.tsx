import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DeleteSnapshotButton from "@/components/buttons/delete-snapshot";
import { getProject } from "@/app/actions/projects";
import { getSnapshots } from "@/app/actions/snapshots";

export default async function SnapshotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await getProject(id);
  if (!project) notFound();

  const snapshots = await getSnapshots(project.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-xs text-zinc-400 hover:text-zinc-600 mb-1 block"
          >
            ← {project.repo_owner}/{project.repo_name}
          </Link>
          <h1 className="text-lg font-semibold">Snapshot history</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {snapshots.length === 0 ? (
        <div className="border border-dashed border-zinc-300 rounded-xl py-16 text-center">
          <p className="text-sm text-zinc-400">No snapshots yet</p>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white overflow-hidden">
          {snapshots.map((snapshot, index) => (
            <div key={snapshot.id} className="flex items-center justify-between px-5 py-4">
              <Link
                href={`/dashboard/projects/${project.id}/snapshots/${snapshot.id}`}
                className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-70 transition-opacity"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {new Date(snapshot.captured_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-sm text-zinc-400">
                        latest
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {new Date(snapshot.captured_at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {snapshot.total} outdated
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {Number(snapshot.major_count) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {snapshot.major_count} major
                    </Badge>
                  )}
                  {Number(snapshot.pending) > 0 && (
                    <Badge variant="outline" className="text-xs text-zinc-500">
                      {snapshot.pending} pending
                    </Badge>
                  )}
                  {Number(snapshot.major_count) > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                      {snapshot.approved} approved
                    </Badge>
                  )}
                </div>
              </Link>

              <DeleteSnapshotButton snapshotId={snapshot.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
