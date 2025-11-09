import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productOffer, seller, bid } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Query product by ID
    const productResult = await db
      .select()
      .from(productOffer)
      .where(eq(productOffer.id, productId))
      .limit(1);

    if (productResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const product = productResult[0];

    // Query bids for this product
    const productBids = await db
      .select()
      .from(bid)
      .where(eq(bid.productId, productId))
      .orderBy(desc(bid.amount));

    // Map bids to frontend format
    const mappedBids = productBids.map(b => ({
      id: b.id,
      amount: b.amount,
      bidderName: `Bidder ${b.buyerId || 'Unknown'}`,
      createdAt: b.bidDate
    }));

    // Query seller info
    let sellerInfo = null;
    if (product.sellerId) {
      const sellerResult = await db
        .select()
        .from(seller)
        .where(eq(seller.id, product.sellerId))
        .limit(1);

      if (sellerResult.length > 0) {
        sellerInfo = {
          id: sellerResult[0].id,
          username: `Seller ${sellerResult[0].id}`,
          rating: 98.5,
          itemsSold: 100,
          joinedDate: new Date().toISOString()
        };
      }
    }

    // Map product to frontend format
    // Set buyNowPrice to 1.2x the current price for Buy Now option
    const mappedProduct = {
      id: product.id,
      title: product.productName,
      description: product.description,
      price: product.price,
      buyNowPrice: product.price * 1.2, // Buy Now price is 20% higher than starting bid
      condition: product.keyword || 'new',
      shippingCost: 0,
      imageUrl: '/placeholder-image.jpg',
      status: 'active',
      endsAt: product.dateExpiration,
      categoryId: null,
      sellerId: product.sellerId,
      views: 0
    };

    return NextResponse.json(
      {
        product: mappedProduct,
        bids: mappedBids,
        seller: sellerInfo,
        category: null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}