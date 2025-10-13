import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, bids, sellers, categories } from '@/db/schema';
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
      .from(products)
      .where(eq(products.id, productId))
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

    // Query bids for this product, ordered by amount DESC
    const productBids = await db
      .select()
      .from(bids)
      .where(eq(bids.productId, productId))
      .orderBy(desc(bids.amount));

    // Query seller info
    let seller = null;
    if (product.sellerId) {
      const sellerResult = await db
        .select()
        .from(sellers)
        .where(eq(sellers.id, product.sellerId))
        .limit(1);

      if (sellerResult.length > 0) {
        seller = sellerResult[0];
      }
    }

    // Query category info
    let category = null;
    if (product.categoryId) {
      const categoryResult = await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1);

      if (categoryResult.length > 0) {
        category = categoryResult[0];
      }
    }

    // Increment views count
    await db
      .update(products)
      .set({
        views: (product.views || 0) + 1,
      })
      .where(eq(products.id, productId));

    // Return combined data
    return NextResponse.json(
      {
        product: {
          ...product,
          views: (product.views || 0) + 1, // Return updated view count
        },
        bids: productBids,
        seller: seller,
        category: category,
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