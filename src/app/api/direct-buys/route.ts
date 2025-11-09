import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { directBuy, productOffer, buyer } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const buyerId = searchParams.get('buyer_id');
    const productId = searchParams.get('product_id');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(directBuy)
        .where(eq(directBuy.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Direct buy not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters
    let query = db.select().from(directBuy);

    const conditions = [];

    if (buyerId) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json(
          { error: 'Valid buyer ID is required', code: 'INVALID_BUYER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(directBuy.buyerId, parseInt(buyerId)));
    }

    if (productId) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json(
          { error: 'Valid product ID is required', code: 'INVALID_PRODUCT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(directBuy.productId, parseInt(productId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, buyerId } = body;

    // Validate productId if provided
    if (productId !== undefined && productId !== null) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json(
          { error: 'Valid product ID is required', code: 'INVALID_PRODUCT_ID' },
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
          { error: 'Product offer not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate buyerId if provided
    if (buyerId !== undefined && buyerId !== null) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json(
          { error: 'Valid buyer ID is required', code: 'INVALID_BUYER_ID' },
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

    // Prepare insert data
    const insertData: any = {};

    if (productId !== undefined && productId !== null) {
      insertData.productId = parseInt(productId);
    }

    if (buyerId !== undefined && buyerId !== null) {
      insertData.buyerId = parseInt(buyerId);
    }

    // Insert new record
    const newRecord = await db.insert(directBuy).values(insertData).returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(directBuy)
      .where(eq(directBuy.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Direct buy not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { productId, buyerId } = body;

    // Validate productId if provided
    if (productId !== undefined && productId !== null) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json(
          { error: 'Valid product ID is required', code: 'INVALID_PRODUCT_ID' },
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
          { error: 'Product offer not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate buyerId if provided
    if (buyerId !== undefined && buyerId !== null) {
      if (isNaN(parseInt(buyerId))) {
        return NextResponse.json(
          { error: 'Valid buyer ID is required', code: 'INVALID_BUYER_ID' },
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

    // Prepare update data
    const updateData: any = {};

    if (productId !== undefined) {
      updateData.productId = productId !== null ? parseInt(productId) : null;
    }

    if (buyerId !== undefined) {
      updateData.buyerId = buyerId !== null ? parseInt(buyerId) : null;
    }

    // Update record
    const updated = await db
      .update(directBuy)
      .set(updateData)
      .where(eq(directBuy.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(directBuy)
      .where(eq(directBuy.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Direct buy not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deleted = await db
      .delete(directBuy)
      .where(eq(directBuy.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Direct buy deleted successfully',
        record: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}