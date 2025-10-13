"use client"

import { Search, ShoppingCart, User, Heart, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { useState } from "react"
import CartDrawer from "@/components/CartDrawer"

export default function Header() {
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <header className="border-b bg-white">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Hi! <span className="text-blue-600">Sign in</span> or <span className="text-blue-600">register</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Daily Deals</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Help & Contact</Link>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">Sell</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Bell className="w-4 h-4" />
                Notifications
              </Link>
              <button 
                onClick={() => setCartOpen(true)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Main header */}
          <div className="flex items-center gap-4 py-4">
            <Link href="/" className="text-3xl font-bold text-red-600 whitespace-nowrap">
              eBay<span className="text-blue-600 text-xl">Clone</span>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-4xl">
              <div className="flex">
                <select className="px-3 py-2 border border-r-0 rounded-l-md bg-white text-sm">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home & Garden</option>
                  <option>Sports</option>
                  <option>Toys</option>
                  <option>Collectibles</option>
                </select>
                <Input 
                  type="text" 
                  placeholder="Search for anything"
                  className="rounded-none border-x-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700 px-8">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Heart className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>
      
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}