"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HeroBanner() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main banner */}
        <Card className="md:col-span-2 overflow-hidden relative h-80 group cursor-pointer">
          <Image
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop"
            alt="Tech deals"
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white mb-2">Tech Deals</h2>
            <p className="text-white/90 text-lg mb-4">Up to 50% off on electronics</p>
            <Button className="w-fit bg-blue-600 hover:bg-blue-700">Shop Now</Button>
          </div>
        </Card>

        {/* Side banners */}
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden relative h-[9.5rem] group cursor-pointer">
            <Image
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop"
              alt="Fashion sale"
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white">Fashion Sale</h3>
              <p className="text-white/90 text-sm">New arrivals</p>
            </div>
          </Card>
          <Card className="overflow-hidden relative h-[9.5rem] group cursor-pointer">
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
              alt="Home & Garden"
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white">Home & Garden</h3>
              <p className="text-white/90 text-sm">Refresh your space</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}