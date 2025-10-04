'use client'

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={
        'relative overflow-hidden rounded-md bg-gray-200/70 ' +
        'before:absolute before:inset-0 before:-translate-x-full ' +
        'before:animate-[shimmer_1.2s_infinite] ' +
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ' +
        className
      }
    />
  )
}




