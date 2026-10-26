import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/features/dashboard/components";
export default function Loading() {
  return (
    <div className="space-y-6 p-4 pb-28 sm:p-6">
      <div aria-hidden="true" className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
      </div>
      <DashboardSkeleton />
    </div>
  );
}
