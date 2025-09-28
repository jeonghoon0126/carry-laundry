'use client'

import Image from 'next/image'

export default function TopBanner() {
  return (
    <section className="w-full flex justify-center py-4">
      <Image
        src="/assets/IMG_7402.jpeg"
        alt="carry bedding hero"
        width={768}
        height={1159}
        className="mx-auto h-auto w-full max-w-[520px]"
        priority
      />
    </section>
  )
}
