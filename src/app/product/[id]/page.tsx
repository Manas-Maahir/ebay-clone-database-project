"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import CategoryNav from "@/components/CategoryNav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Share2, Clock, TruckIcon, Shield, Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useCart } from "@/contexts/CartContext"

interface Product {
  id: number
  title: string
  description: string | null
  price: number
  buyNowPrice: number | null
  condition: string
  shippingCost: number
  imageUrl: string
  status: string
  endsAt: string | null
  categoryId: number
  sellerId: number
}

interface Bid {
  id: number
  amount: number
  bidderName: string
  createdAt: string
}

interface Seller {
  id: number
  username: string
  rating: number
  itemsSold: number
  joinedDate: string
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [seller, setSeller] = useState<Seller | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [placingBid, setPlacingBid] = useState(false)
  const [addingToWatch, setAddingToWatch] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) throw new Error('Product not found')
        
        const data = await response.json()
        setProduct(data.product)
        setBids(data.bids || [])
        setSeller(data.seller)
        setCategory(data.category)
        
        // Set initial bid amount slightly higher than current price
        if (data.product) {
          setBidAmount((data.product.price + 10).toFixed(2))
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const calculateTimeLeft = (endsAt: string | null) => {
    if (!endsAt) return null
    const end = new Date(endsAt).getTime()
    const now = Date.now()
    const diff = end - now
    
    if (diff <= 0) return "Ended"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m left`
  }

  const handlePlaceBid = async () => {
    if (!product) return
    
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount <= product.price) {
      toast.error(`Bid must be higher than current price ($${product.price.toFixed(2)})`)
      return
    }

    setPlacingBid(true)
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          bidderName: 'guest_user',
          amount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to place bid')
      }

      const newBid = await response.json()
      setBids(prev => [newBid, ...prev])
      setProduct(prev => prev ? { ...prev, price: amount } : null)
      setBidAmount((amount + 10).toFixed(2))
      toast.success('Bid placed successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place bid')
    } finally {
      setPlacingBid(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.buyNowPrice || product.price,
      image: product.imageUrl,
      shipping: product.shippingCost
    })
    
    toast.success('Added to cart!')
  }

  const handleAddToWatch = async () => {
    if (!product) return
    
    setAddingToWatch(true)
    try {
      const response = await fetch('/api/watches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          watcherName: 'guest_user'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to watch list')
      }

      toast.success('Added to watch list!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to watch list')
    } finally {
      setAddingToWatch(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryNav />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="aspect-square bg-gray-200 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CategoryNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const timeLeft = calculateTimeLeft(product.endsAt)
  const shipping = product.shippingCost === 0 ? "Free shipping" : `$${product.shippingCost.toFixed(2)} shipping`

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>

            {/* Product Details Tabs */}
            <Card className="mt-6 p-6">
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4 space-y-4">
                  <h3 className="font-bold text-lg">Product Description</h3>
                  <p className="text-muted-foreground">
                    {product.description || 'No description available for this product.'}
                  </p>
                  <div className="border-t pt-4">
                    <p className="text-sm"><strong>Condition:</strong> {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}</p>
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="mt-4 space-y-4">
                  <h3 className="font-bold text-lg">Shipping Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <TruckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">{shipping}</p>
                        <p className="text-sm text-muted-foreground">Estimated delivery: 3-5 business days</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bids" className="mt-4 space-y-4">
                  <h3 className="font-bold text-lg">Bid History</h3>
                  {bids.length === 0 ? (
                    <p className="text-muted-foreground">No bids yet. Be the first to bid!</p>
                  ) : (
                    <div className="space-y-2">
                      {bids.map((bid) => (
                        <div key={bid.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{bid.bidderName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(bid.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-lg">${bid.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Purchase Info */}
          <div className="space-y-4">
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              
              <Badge className="mb-4">
                {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
              </Badge>

              {/* Price Section */}
              <div className="border-t border-b py-4 my-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current bid</p>
                    <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{bids.length} bids</p>
                  </div>
                  
                  {timeLeft && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{timeLeft}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bidding */}
              {product.status === 'active' && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Enter your maximum bid
                    </label>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    onClick={handlePlaceBid}
                    disabled={placingBid}
                  >
                    {placingBid ? 'Placing Bid...' : 'Place Bid'}
                  </Button>
                  {product.buyNowPrice && (
                    <>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        size="lg"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart - ${product.buyNowPrice.toFixed(2)}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleAddToWatch}
                  disabled={addingToWatch}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {addingToWatch ? 'Adding...' : 'Watch'}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start gap-2">
                  <TruckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{shipping}</p>
                    <p className="text-sm text-muted-foreground">Arrives in 3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">eBay Money Back Guarantee</p>
                    <p className="text-sm text-muted-foreground">Get the item you ordered or your money back</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Seller Info */}
            {seller && (
              <Card className="p-6">
                <h3 className="font-bold mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback>{seller.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{seller.username}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{seller.rating.toFixed(1)}% positive</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items sold:</span>
                    <span className="font-medium">{seller.itemsSold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">
                      {new Date(seller.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Contact Seller
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}