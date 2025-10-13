"use client"

import Header from "@/components/Header"
import CategoryNav from "@/components/CategoryNav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Package, Heart, Settings, Clock, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const watchedItems = [
  {
    id: 1,
    title: "Apple iPhone 15 Pro Max 256GB",
    price: 1199.99,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop",
    timeLeft: "2h 15m",
    bids: 24
  },
  {
    id: 2,
    title: "Sony WH-1000XM5 Headphones",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcf?w=200&h=200&fit=crop",
    timeLeft: "5h 30m",
    bids: 12
  }
]

const purchaseHistory = [
  {
    id: 1,
    title: "Samsung Galaxy S24 Ultra 512GB",
    price: 1099.99,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop",
    date: "Jan 15, 2024",
    status: "Delivered"
  },
  {
    id: 2,
    title: "MacBook Air 15\" M3",
    price: 1299.00,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop",
    date: "Jan 8, 2024",
    status: "In Transit"
  }
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-xl">John Doe</h2>
                <p className="text-sm text-muted-foreground">@johndoe</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">98.5% positive</span>
                </div>
              </div>

              <nav className="space-y-1">
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 text-blue-600 font-medium"
                >
                  <Package className="w-4 h-4" />
                  My eBay
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <Heart className="w-4 h-4" />
                  Watching
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <Clock className="w-4 h-4" />
                  Purchase History
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Link>
              </nav>

              <Button className="w-full mt-6" variant="outline">
                Start Selling
              </Button>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="watching">Watching</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">Active Orders</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">24</p>
                        <p className="text-sm text-muted-foreground">Watching</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">89</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop"
                          alt="Product"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">You won the auction</p>
                        <p className="text-sm text-muted-foreground">Samsung Galaxy S24 Ultra</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                      <Badge variant="secondary">Won</Badge>
                    </div>
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop"
                          alt="Product"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Item shipped</p>
                        <p className="text-sm text-muted-foreground">MacBook Air 15" M3</p>
                        <p className="text-sm text-muted-foreground">1 day ago</p>
                      </div>
                      <Badge className="bg-blue-600">Shipped</Badge>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="watching" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Watched Items ({watchedItems.length})</h3>
                  <div className="space-y-4">
                    {watchedItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.bids} bids</p>
                          <p className="text-sm text-red-600 font-medium">{item.timeLeft} left</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${item.price.toFixed(2)}</p>
                          <Button size="sm" className="mt-2">Place Bid</Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Purchase History</h3>
                  <div className="space-y-4">
                    {purchaseHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                          <Badge className={item.status === "Delivered" ? "bg-green-600" : "bg-blue-600"}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${item.price.toFixed(2)}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">View Order</Button>
                            <Button size="sm" variant="outline">Buy Again</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Account Settings</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">First Name</label>
                        <Input defaultValue="John" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Last Name</label>
                        <Input defaultValue="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input type="email" defaultValue="john.doe@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <Input type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Address</label>
                      <Input defaultValue="123 Main St, New York, NY 10001" />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                  </form>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Change Password</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Current Password</label>
                      <Input type="password" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">New Password</label>
                      <Input type="password" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                      <Input type="password" />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}