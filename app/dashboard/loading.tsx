import ProjectCardSkeleton from "@/components/skeletons/project-card";

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-6 w-24 bg-zinc-100 rounded animate-pulse" />
          <div className="h-4 w-48 bg-zinc-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-zinc-100 rounded animate-pulse" />
      </div>

      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
