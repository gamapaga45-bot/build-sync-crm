/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-white rounded-xl border border-slate-100 shadow-sm h-[300px] flex flex-col">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex-1 flex items-end gap-4">
        <Skeleton className="h-[60%] flex-1" />
        <Skeleton className="h-[80%] flex-1" />
        <Skeleton className="h-[40%] flex-1" />
        <Skeleton className="h-[90%] flex-1" />
        <Skeleton className="h-[50%] flex-1" />
        <Skeleton className="h-[70%] flex-1" />
      </div>
    </div>
  );
}
