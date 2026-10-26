import { ContentSkeleton } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6 p-4 pb-28 sm:p-6">
      <div aria-hidden="true" className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="border-border/50 space-y-3 rounded-2xl border p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
      <ContentSkeleton columns={7} />
    </div>
  );
}
