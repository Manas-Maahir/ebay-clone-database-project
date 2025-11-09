import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productOffer, seller } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sellerId = searchParams.get('seller_id');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sortField = searchParams.get('sort') || 'id';
    const sortOrder = searchParams.get('order') || 'desc';

    let conditions = [];

    // Search by productName or description
    if (search) {
      conditions.push(
        or(
          like(productOffer.productName, `%${search}%`),
          like(productOffer.description, `%${search}%`)
        )
      );
    }

    // Filter by sellerId
    if (sellerId && !isNaN(parseInt(sellerId))) {
      conditions.push(eq(productOffer.sellerId, parseInt(sellerId)));
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        conditions.push(gte(productOffer.price, min));
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        conditions.push(lte(productOffer.price, max));
      }
    }

    let query = db.select().from(productOffer);

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const sortColumn = sortField === 'price' ? productOffer.price : productOffer.id;
    const sortDirection = sortOrder === 'asc' ? asc : desc;
    query = query.orderBy(sortDirection(sortColumn));

    const results = await query.limit(limit).offset(offset);

    // Map to frontend expected format
    const mappedResults = results.map(product => ({
      id: product.id,
      title: product.productName,
      description: product.description,
      price: product.price,
      buyNowPrice: product.price * 1.2, // Buy Now price is 20% higher than starting bid
      condition: product.keyword || 'new',
      shippingCost: 0, // Default to free shipping
      imageUrl: '/placeholder-image.jpg', // Placeholder since not in schema
      status: 'active',
      endsAt: product.dateExpiration,
      categoryId: null, // Not in schema
      sellerId: product.sellerId,
      views: 0,
      createdAt: new Date().toISOString()
    }));

    return NextResponse.json(mappedResults, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}