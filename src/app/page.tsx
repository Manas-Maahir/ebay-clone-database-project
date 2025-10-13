import Header from "@/components/Header"
import CategoryNav from "@/components/CategoryNav"
import HeroBanner from "@/components/HeroBanner"
import FeaturedItems from "@/components/FeaturedItems"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav />
      <HeroBanner />
      <FeaturedItems />
      
      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Buy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Registration</a></li>
                <li><a href="#" className="hover:text-foreground">Bidding & buying help</a></li>
                <li><a href="#" className="hover:text-foreground">Stores</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Sell</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Start selling</a></li>
                <li><a href="#" className="hover:text-foreground">Learn to sell</a></li>
                <li><a href="#" className="hover:text-foreground">Business sellers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Stay connected</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">eBay's Blogs</a></li>
                <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">About eBay</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Company info</a></li>
                <li><a href="#" className="hover:text-foreground">Policies</a></li>
                <li><a href="#" className="hover:text-foreground">Government relations</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>Copyright © 1995-2024 eBay Clone. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}