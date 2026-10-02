export default function Loading() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      {/* Top breadcrumb skeleton */}
      <div className="h-4 w-36 bg-neutral-200 rounded-md mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery / Image Skeleton */}
        <div className="space-y-4">
          <div className="w-full aspect-[3/4] bg-neutral-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-square bg-neutral-200 rounded-xl" />
            <div className="aspect-square bg-neutral-200 rounded-xl" />
            <div className="aspect-square bg-neutral-200 rounded-xl" />
            <div className="aspect-square bg-neutral-200 rounded-xl" />
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="space-y-6 pt-2">
          <div className="h-8 w-3/4 bg-neutral-200 rounded-lg" />
          <div className="h-6 w-1/3 bg-neutral-200 rounded-md" />
          <div className="h-20 w-full bg-neutral-100 rounded-xl" />

          {/* Color & Size Pills Skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-20 bg-neutral-200 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-200" />
              <div className="w-8 h-8 rounded-full bg-neutral-200" />
              <div className="w-8 h-8 rounded-full bg-neutral-200" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="h-4 w-24 bg-neutral-200 rounded" />
            <div className="flex gap-2">
              <div className="w-12 h-10 rounded-xl bg-neutral-200" />
              <div className="w-12 h-10 rounded-xl bg-neutral-200" />
              <div className="w-12 h-10 rounded-xl bg-neutral-200" />
              <div className="w-12 h-10 rounded-xl bg-neutral-200" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="h-14 w-full bg-neutral-300 rounded-2xl mt-8" />
        </div>
      </div>
    </div>
  );
}
