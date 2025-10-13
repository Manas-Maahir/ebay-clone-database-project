"use client"

import Link from "next/link"

const categories = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Hobbies",
  "Collectibles & Art",
  "Motors",
  "Health & Beauty",
  "Business & Industrial"
]

export default function CategoryNav() {
  return (
    <nav className="border-b bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-white rounded whitespace-nowrap transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}