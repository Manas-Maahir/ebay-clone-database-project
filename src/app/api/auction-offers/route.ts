import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auctionOffer, bid } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch with joined bid data if bidId exists
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(auctionOffer)
        .where(eq(auctionOffer.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Auction offer not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      // If bidId exists, fetch joined bid data
      let result = record[0];
      if (result.bidId) {
        const bidData = await db
          .select()
          .from(bid)
          .where(eq(bid.id, result.bidId))
          .limit(1);

        if (bidData.length > 0) {
          result = { ...result, bid: bidData[0] };
        }
      }

      return NextResponse.json(result, { status: 200 });
    }

    // List with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db
      .select()
      .from(auctionOffer)
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
    const { minPrice, winnerName, bidId } = body;

    // Validate required fields
    if (minPrice === undefined || minPrice === null) {
      return NextResponse.json(
        { error: 'minPrice is required', code: 'MISSING_REQUIRED_FIELD' },
        { status: 400 }
      );
    }

    // Validate minPrice > 0
    if (typeof minPrice !== 'number' || minPrice <= 0) {
      return NextResponse.json(
        { error: 'minPrice must be greater than 0', code: 'INVALID_MIN_PRICE' },
        { status: 400 }
      );
    }

    // Validate bidId exists if provided
    if (bidId !== undefined && bidId !== null) {
      if (typeof bidId !== 'number' || bidId <= 0) {
        return NextResponse.json(
          { error: 'bidId must be a valid positive integer', code: 'INVALID_BID_ID' },
          { status: 400 }
        );
      }

      const bidExists = await db
        .select()
        .from(bid)
        .where(eq(bid.id, bidId))
        .limit(1);

      if (bidExists.length === 0) {
        return NextResponse.json(
          { error: 'Referenced bid does not exist', code: 'BID_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: {
      minPrice: number;
      winnerName?: string;
      bidId?: number;
    } = {
      minPrice,
    };

    if (winnerName !== undefined && winnerName !== null) {
      insertData.winnerName = typeof winnerName === 'string' ? winnerName.trim() : winnerName;
    }

    if (bidId !== undefined && bidId !== null) {
      insertData.bidId = bidId;
    }

    const newRecord = await db.insert(auctionOffer).values(insertData).returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(auctionOffer)
      .where(eq(auctionOffer.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Auction offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { minPrice, winnerName, bidId } = body;

    // Validate minPrice if updating
    if (minPrice !== undefined && minPrice !== null) {
      if (typeof minPrice !== 'number' || minPrice <= 0) {
        return NextResponse.json(
          { error: 'minPrice must be greater than 0', code: 'INVALID_MIN_PRICE' },
          { status: 400 }
        );
      }
    }

    // Validate bidId exists if updating
    if (bidId !== undefined && bidId !== null) {
      if (typeof bidId !== 'number' || bidId <= 0) {
        return NextResponse.json(
          { error: 'bidId must be a valid positive integer', code: 'INVALID_BID_ID' },
          { status: 400 }
        );
      }

      const bidExists = await db
        .select()
        .from(bid)
        .where(eq(bid.id, bidId))
        .limit(1);

      if (bidExists.length === 0) {
        return NextResponse.json(
          { error: 'Referenced bid does not exist', code: 'BID_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      minPrice?: number;
      winnerName?: string | null;
      bidId?: number | null;
    } = {};

    if (minPrice !== undefined && minPrice !== null) {
      updateData.minPrice = minPrice;
    }

    if (winnerName !== undefined) {
      updateData.winnerName = winnerName !== null && typeof winnerName === 'string' 
        ? winnerName.trim() 
        : winnerName;
    }

    if (bidId !== undefined) {
      updateData.bidId = bidId;
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    const updated = await db
      .update(auctionOffer)
      .set(updateData)
      .where(eq(auctionOffer.id, parseInt(id)))
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(auctionOffer)
      .where(eq(auctionOffer.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Auction offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(auctionOffer)
      .where(eq(auctionOffer.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Auction offer deleted successfully',
        deleted: deleted[0],
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