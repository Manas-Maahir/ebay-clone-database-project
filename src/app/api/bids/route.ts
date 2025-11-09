import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bid, buyer, productOffer } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const buyerId = searchParams.get('buyer_id');
    const productId = searchParams.get('product_id');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single bid by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(bid)
        .where(eq(bid.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Bid not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters
    let query = db.select().from(bid);

    const conditions = [];

    if (buyerId) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json(
          { error: 'Valid buyer ID is required', code: 'INVALID_BUYER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(bid.buyerId, parseInt(buyerId)));
    }

    if (productId) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json(
          { error: 'Valid product ID is required', code: 'INVALID_PRODUCT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(bid.productId, parseInt(productId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(bid.amount))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, bidDate, buyerId, productId } = body;

    // Validate required fields
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate amount > 0
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate buyerId if provided
    if (buyerId !== undefined && buyerId !== null) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json(
          { error: 'Invalid buyer ID', code: 'INVALID_BUYER_ID' },
          { status: 400 }
        );
      }

      const buyerExists = await db
        .select()
        .from(buyer)
        .where(eq(buyer.id, parseInt(buyerId)))
        .limit(1);

      if (buyerExists.length === 0) {
        return NextResponse.json(
          { error: 'Buyer not found', code: 'BUYER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate productId if provided
    if (productId !== undefined && productId !== null) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json(
          { error: 'Invalid product ID', code: 'INVALID_PRODUCT_ID' },
          { status: 400 }
        );
      }

      const productExists = await db
        .select()
        .from(productOffer)
        .where(eq(productOffer.id, parseInt(productId)))
        .limit(1);

      if (productExists.length === 0) {
        return NextResponse.json(
          { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    const insertData: {
      amount: number;
      bidDate: string;
      buyerId?: number;
      productId?: number;
    } = {
      amount,
      bidDate: bidDate || new Date().toISOString(),
    };

    if (buyerId !== undefined && buyerId !== null) {
      insertData.buyerId = parseInt(buyerId);
    }

    if (productId !== undefined && productId !== null) {
      insertData.productId = parseInt(productId);
    }

    const newBid = await db.insert(bid).values(insertData).returning();

    return NextResponse.json(newBid[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(bid)
      .where(eq(bid.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Bid not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, bidDate, buyerId, productId } = body;

    const updates: {
      amount?: number;
      bidDate?: string;
      buyerId?: number | null;
      productId?: number | null;
    } = {};

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      updates.amount = amount;
    }

    if (bidDate !== undefined) {
      updates.bidDate = bidDate;
    }

    if (buyerId !== undefined) {
      if (buyerId !== null) {
        const buyerExists = await db
          .select()
          .from(buyer)
          .where(eq(buyer.id, parseInt(buyerId)))
          .limit(1);

        if (buyerExists.length === 0) {
          return NextResponse.json(
            { error: 'Buyer not found', code: 'BUYER_NOT_FOUND' },
            { status: 400 }
          );
        }
        updates.buyerId = parseInt(buyerId);
      } else {
        updates.buyerId = null;
      }
    }

    if (productId !== undefined) {
      if (productId !== null) {
        const productExists = await db
          .select()
          .from(productOffer)
          .where(eq(productOffer.id, parseInt(productId)))
          .limit(1);

        if (productExists.length === 0) {
          return NextResponse.json(
            { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
            { status: 400 }
          );
        }
        updates.productId = parseInt(productId);
      } else {
        updates.productId = null;
      }
    }

    const updated = await db
      .update(bid)
      .set(updates)
      .where(eq(bid.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(bid)
      .where(eq(bid.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Bid not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(bid)
      .where(eq(bid.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Bid deleted successfully',
        bid: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}