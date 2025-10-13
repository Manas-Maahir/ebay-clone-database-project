"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TruckIcon, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useCart } from "@/contexts/CartContext"

interface Product {
  id: number
  title: string
  price: number
  buyNowPrice: number | null
  imageUrl: string
  shippingCost: number
  endsAt: string | null
}

export default function FeaturedItems() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data.slice(0, 8))
      } catch (error) {
        console.error('Failed to fetch products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.buyNowPrice || product.price,
      image: product.imageUrl,
      shipping: product.shippingCost
    })
    
    toast.success('Added to cart!')
  }

  const calculateTimeLeft = (endsAt: string | null) => {
    if (!endsAt) return null
    const end = new Date(endsAt).getTime()
    const now = Date.now()
    const diff = end - now
    
    if (diff <= 0) return "Ended"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h left`
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Today's Deals – All With Free Shipping</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Today's Deals – All With Free Shipping</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const timeLeft = calculateTimeLeft(product.endsAt)
          const shipping = product.shippingCost === 0 ? "Free shipping" : `$${product.shippingCost.toFixed(2)} shipping`
          
          return (
            <Link href={`/product/${product.id}`} key={product.id}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">
                    {product.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                      {product.buyNowPrice && (
                        <span className="text-sm text-muted-foreground">
                          Buy Now: ${product.buyNowPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TruckIcon className="w-4 h-4" />
                      <span>{shipping}</span>
                    </div>
                    {timeLeft && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <Clock className="w-4 h-4" />
                        <span>{timeLeft}</span>
                      </div>
                    )}
                    {product.buyNowPrice && (
                      <Button 
                        className="w-full mt-2" 
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}