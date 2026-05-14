import PackageRowSkeleton from "@/components/skeletons/package-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProjectLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="space-y-8">
        <section>
          <Skeleton className="h-3 w-24 mb-3" />
          <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <PackageRowSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
