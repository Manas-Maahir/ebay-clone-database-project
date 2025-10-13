"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import CategoryNav from "@/components/CategoryNav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: number
  title: string
  price: number
  imageUrl: string
  condition: string
  shippingCost: number
  buyNowPrice: number | null
  endsAt: string | null
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("best")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch category by slug
        const categoriesRes = await fetch('/api/categories')
        const categories = await categoriesRes.json()
        const foundCategory = categories.find((c: Category) => c.slug === params.slug)
        
        if (foundCategory) {
          setCategory(foundCategory)
          
          // Fetch products for this category
          let url = `/api/products?category_id=${foundCategory.id}&limit=50`
          
          // Apply sorting
          if (sortBy === "price-low") url += "&sort=price&order=asc"
          else if (sortBy === "price-high") url += "&sort=price&order=desc"
          else if (sortBy === "newest") url += "&sort=createdAt&order=desc"
          
          const productsRes = await fetch(url)
          let fetchedProducts = await productsRes.json()
          
          // Apply client-side filters
          if (priceRange[0] > 0 || priceRange[1] < 5000) {
            fetchedProducts = fetchedProducts.filter((p: Product) => 
              p.price >= priceRange[0] && p.price <= priceRange[1]
            )
          }
          
          if (selectedConditions.length > 0) {
            fetchedProducts = fetchedProducts.filter((p: Product) =>
              selectedConditions.includes(p.condition)
            )
          }
          
          setProducts(fetchedProducts)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug, sortBy, priceRange, selectedConditions])

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">
            {category?.name || params.slug.replace(/-/g, ' ')}
          </span>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <Card className="p-4">
              <div className="space-y-6">
                {/* Price Filter */}
                <div>
                  <h3 className="font-bold mb-3">Price</h3>
                  <div className="space-y-3">
                    <Slider 
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000} 
                      step={50} 
                    />
                    <div className="flex gap-2 text-sm">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-1 border rounded"
                      />
                      <span className="py-1">-</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <h3 className="font-bold mb-3">Condition</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="new" 
                        checked={selectedConditions.includes('new')}
                        onCheckedChange={() => toggleCondition('new')}
                      />
                      <label htmlFor="new" className="text-sm cursor-pointer">New</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="used"
                        checked={selectedConditions.includes('used')}
                        onCheckedChange={() => toggleCondition('used')}
                      />
                      <label htmlFor="used" className="text-sm cursor-pointer">Used</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="refurbished"
                        checked={selectedConditions.includes('refurbished')}
                        onCheckedChange={() => toggleCondition('refurbished')}
                      />
                      <label htmlFor="refurbished" className="text-sm cursor-pointer">Refurbished</label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {category?.name || params.slug.replace(/-/g, ' ')}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {loading ? '...' : `${products.length} results`}
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best">Best Match</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No products found in this category
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const timeLeft = calculateTimeLeft(product.endsAt)
                  const shipping = product.shippingCost === 0 ? "Free shipping" : `$${product.shippingCost.toFixed(2)} shipping`
                  
                  return (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                        <div className="relative aspect-square bg-gray-100">
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-blue-600">
                            {product.title}
                          </h3>
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                              {product.buyNowPrice && (
                                <Badge variant="secondary" className="text-xs">Buy It Now</Badge>
                              )}
                            </div>
                            {timeLeft && (
                              <p className="text-sm text-red-600 font-medium">{timeLeft}</p>
                            )}
                            <p className="text-sm text-green-600">{shipping}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}