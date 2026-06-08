import { Skeleton } from "../ui/skeleton";

export default function ProjectCardSkeleton() {
  return (
    <div className="border border-border rounded-lg px-5 py-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}
