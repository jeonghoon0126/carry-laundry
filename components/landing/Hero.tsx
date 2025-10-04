'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ReviewsCarousel from './ReviewsCarousel'

export default function Hero() {
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const iconVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }


  return (
    <>
      {/* Hero Logo Image - First in DOM */}
      <section className="w-full flex justify-center py-2">
        <Image
          src="/assets/hero.png"
          alt="Carry hero logo"
          width={800}
          height={400}
          className="mx-auto h-auto w-full max-w-[520px]"
          priority
        />
      </section>


      {/* IMG_7402 Image - Third in DOM */}
      <section className="w-full flex justify-center py-2">
        <picture>
          <source srcSet="/assets/IMG_7402.webp" type="image/webp" />
          <Image
            src="/assets/IMG_7402.jpeg"
            alt="Carry Bedding Hero"
            width={768}
            height={1159}
            className="mx-auto h-auto w-full max-w-[520px]"
            sizes="(max-width: 640px) 100vw, 520px"
            priority
          />
        </picture>
      </section>

      {/* Hero Images 2-6 */}
      <div className="space-y-0 gap-y-0 p-0 m-0">
        <section className="w-full flex justify-center py-2">
          <Image src="/assets/hero_2.png" alt="Hero 2" width={1200} height={800} className="mx-auto h-auto w-full max-w-[520px] block" />
        </section>
        <section className="w-full flex justify-center py-2">
          <Image src="/assets/hero_3.png" alt="Hero 3" width={1200} height={800} className="mx-auto h-auto w-full max-w-[520px] block" />
        </section>
        <section className="w-full flex justify-center py-2">
          <Image src="/assets/hero_4.png" alt="Hero 4" width={1200} height={800} className="mx-auto h-auto w-full max-w-[520px] block" />
        </section>
        <section className="w-full flex justify-center py-2">
          <Image src="/assets/hero_5.png" alt="Hero 5" width={1200} height={800} className="mx-auto h-auto w-full max-w-[520px] block" />
        </section>
        <section className="py-4 w-full flex justify-center">
          <div className="w-full max-w-[520px]">
            <ReviewsCarousel />
          </div>
        </section>
        <section className="w-full flex justify-center py-2">
          <Image src="/assets/hero_6.png" alt="Hero 6" width={1200} height={800} className="mx-auto h-auto w-full max-w-[520px] block" />
        </section>
      </div>
      
    </>
  )
}