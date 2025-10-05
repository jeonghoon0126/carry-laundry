import Skeleton from '@/components/common/Skeleton'

export default function CheckoutSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 py-3">
        <Skeleton h={8} w={8} className="rounded-full" />
        <Skeleton h={6} w={32} />
      </div>

      {/* Address Card Skeleton */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-start gap-3">
          <Skeleton h={5} w={5} className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton h={4} w={16} />
            <Skeleton h={4} w={48} />
            <Skeleton h={3} w={32} />
          </div>
          <Skeleton h={8} w={12} />
        </div>
      </div>

      {/* Time Selection Skeleton */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton h={5} w={5} className="rounded-full" />
            <Skeleton h={4} w={24} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, j) => (
              <Skeleton key={j} h={12} className="rounded-lg" />
            ))}
          </div>
        </div>
      ))}

      {/* Special Requests Skeleton */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton h={5} w={5} className="rounded-full" />
          <Skeleton h={4} w={20} />
        </div>
        <Skeleton h={20} className="rounded-lg" />
      </div>

      {/* Payment Method Skeleton */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton h={5} w={5} className="rounded-full" />
          <Skeleton h={4} w={20} />
        </div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
              <Skeleton h={4} w={4} className="rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton h={4} w={24} />
                <Skeleton h={3} w={32} />
              </div>
              <Skeleton h={6} w={12} />
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary Skeleton */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <Skeleton h={4} w={20} className="mb-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton h={4} w={24} />
            <Skeleton h={4} w={16} />
          </div>
          <div className="flex justify-between">
            <Skeleton h={4} w={16} />
            <Skeleton h={4} w={12} />
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <Skeleton h={4} w={20} />
              <Skeleton h={4} w={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Skeleton */}
      <div className="sticky bottom-4 pt-4">
        <Skeleton h={14} className="rounded-lg" />
      </div>
    </div>
  )
}
