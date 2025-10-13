import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bids, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('product_id');

    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { 
          error: 'Valid product_id is required',
          code: 'INVALID_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    const allBids = await db
      .select()
      .from(bids)
      .where(eq(bids.productId, parseInt(productId)))
      .orderBy(desc(bids.amount));

    return NextResponse.json(allBids, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, bidderName, amount } = body;

    if (!productId) {
      return NextResponse.json(
        {
          error: 'productId is required',
          code: 'MISSING_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    if (!bidderName || bidderName.trim() === '') {
      return NextResponse.json(
        {
          error: 'bidderName is required and must be non-empty',
          code: 'MISSING_BIDDER_NAME'
        },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        {
          error: 'amount is required',
          code: 'MISSING_AMOUNT'
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          error: 'amount must be a positive number',
          code: 'INVALID_AMOUNT'
        },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0 || product[0].status !== 'active') {
      return NextResponse.json(
        {
          error: 'Product not found or not active',
          code: 'PRODUCT_NOT_FOUND_OR_NOT_ACTIVE'
        },
        { status: 400 }
      );
    }

    if (amount <= product[0].price) {
      return NextResponse.json(
        {
          error: 'Bid amount must be higher than current price',
          code: 'BID_AMOUNT_TOO_LOW'
        },
        { status: 400 }
      );
    }

    const sanitizedBidderName = bidderName.trim();
    const createdAt = new Date().toISOString();

    const newBid = await db
      .insert(bids)
      .values({
        productId,
        bidderName: sanitizedBidderName,
        amount,
        createdAt
      })
      .returning();

    await db
      .update(products)
      .set({ price: amount })
      .where(eq(products.id, productId));

    return NextResponse.json(newBid[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}