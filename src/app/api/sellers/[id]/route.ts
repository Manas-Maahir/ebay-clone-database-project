import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellers, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Query seller by ID
    const seller = await db
      .select()
      .from(sellers)
      .where(eq(sellers.id, parseInt(id)))
      .limit(1);

    // Check if seller exists
    if (seller.length === 0) {
      return NextResponse.json(
        {
          error: 'Seller not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Query all products for this seller
    const sellerProducts = await db
      .select()
      .from(products)
      .where(eq(products.sellerId, parseInt(id)));

    // Return combined response
    return NextResponse.json(
      {
        seller: seller[0],
        products: sellerProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET seller error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}