import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyer, userAccount } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single buyer by ID with joined userAccount data
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const buyerRecord = await db
        .select({
          id: buyer.id,
          userId: buyer.userId,
          userAccount: {
            id: userAccount.id,
            username: userAccount.username,
            email: userAccount.email,
            name: userAccount.name,
            emailVerified: userAccount.emailVerified,
            image: userAccount.image,
            createdAt: userAccount.createdAt,
            updatedAt: userAccount.updatedAt,
          },
        })
        .from(buyer)
        .leftJoin(userAccount, eq(buyer.userId, userAccount.id))
        .where(eq(buyer.id, parseInt(id)))
        .limit(1);

      if (buyerRecord.length === 0) {
        return NextResponse.json(
          { error: 'Buyer not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(buyerRecord[0], { status: 200 });
    }

    // List all buyers with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const buyers = await db
      .select()
      .from(buyer)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(buyers, { status: 200 });
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
    const { userId } = body;

    // Validate userId exists in userAccount if provided
    if (userId !== undefined && userId !== null) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Invalid userId format', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const userExists = await db
        .select()
        .from(userAccount)
        .where(eq(userAccount.id, parseInt(userId)))
        .limit(1);

      if (userExists.length === 0) {
        return NextResponse.json(
          { error: 'User account not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    const newBuyer = await db
      .insert(buyer)
      .values({
        userId: userId !== undefined && userId !== null ? parseInt(userId) : null,
      })
      .returning();

    return NextResponse.json(newBuyer[0], { status: 201 });
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

    // Check if buyer exists
    const existingBuyer = await db
      .select()
      .from(buyer)
      .where(eq(buyer.id, parseInt(id)))
      .limit(1);

    if (existingBuyer.length === 0) {
      return NextResponse.json(
        { error: 'Buyer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    // Validate userId exists in userAccount if updating userId
    if (userId !== undefined && userId !== null) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Invalid userId format', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const userExists = await db
        .select()
        .from(userAccount)
        .where(eq(userAccount.id, parseInt(userId)))
        .limit(1);

      if (userExists.length === 0) {
        return NextResponse.json(
          { error: 'User account not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    const updatedBuyer = await db
      .update(buyer)
      .set({
        userId: userId !== undefined && userId !== null ? parseInt(userId) : null,
      })
      .where(eq(buyer.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedBuyer[0], { status: 200 });
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

    // Check if buyer exists
    const existingBuyer = await db
      .select()
      .from(buyer)
      .where(eq(buyer.id, parseInt(id)))
      .limit(1);

    if (existingBuyer.length === 0) {
      return NextResponse.json(
        { error: 'Buyer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(buyer)
      .where(eq(buyer.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Buyer deleted successfully',
        buyer: deleted[0],
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