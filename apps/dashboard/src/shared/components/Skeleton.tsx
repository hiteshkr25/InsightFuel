import { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="h-64 flex items-end justify-between space-x-2 pt-6">
        <Skeleton className="h-[20%] w-full rounded" />
        <Skeleton className="h-[45%] w-full rounded" />
        <Skeleton className="h-[30%] w-full rounded" />
        <Skeleton className="h-[75%] w-full rounded" />
        <Skeleton className="h-[60%] w-full rounded" />
        <Skeleton className="h-[90%] w-full rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-8 w-full rounded" />
        <Skeleton className="h-8 w-full rounded" />
        <Skeleton className="h-8 w-full rounded" />
        <Skeleton className="h-8 w-full rounded" />
      </div>
    </div>
  );
}
