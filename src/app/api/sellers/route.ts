import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellers } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single seller by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const seller = await db
        .select()
        .from(sellers)
        .where(eq(sellers.id, parseInt(id)))
        .limit(1);

      if (seller.length === 0) {
        return NextResponse.json(
          { error: 'Seller not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(seller[0], { status: 200 });
    }

    // List sellers with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(sellers);

    if (search) {
      query = query.where(
        or(
          like(sellers.username, `%${search}%`),
          like(sellers.email, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { username, email, rating, itemsSold, avatarUrl } = body;

    // Validate required fields
    const trimmedUsername = username?.trim();
    const trimmedEmail = email?.trim();

    if (!trimmedUsername) {
      return NextResponse.json(
        { error: 'Username is required', code: 'MISSING_USERNAME' },
        { status: 400 }
      );
    }

    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!trimmedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedUsername = trimmedUsername;
    const sanitizedEmail = trimmedEmail.toLowerCase();
    const sanitizedAvatarUrl = avatarUrl?.trim();

    // Check for duplicate username
    const existingUsername = await db
      .select()
      .from(sellers)
      .where(eq(sellers.username, sanitizedUsername))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists', code: 'DUPLICATE_USERNAME' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingEmail = await db
      .select()
      .from(sellers)
      .where(eq(sellers.email, sanitizedEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 400 }
      );
    }

    // Create new seller with defaults and auto-generated fields
    const now = new Date().toISOString();
    const newSeller = await db
      .insert(sellers)
      .values({
        username: sanitizedUsername,
        email: sanitizedEmail,
        rating: rating !== undefined ? rating : 0,
        itemsSold: itemsSold !== undefined ? itemsSold : 0,
        avatarUrl: sanitizedAvatarUrl || null,
        joinedDate: now,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newSeller[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const sellerId = parseInt(id);

    // Check if seller exists
    const existingSeller = await db
      .select()
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (existingSeller.length === 0) {
      return NextResponse.json(
        { error: 'Seller not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { username, email, rating, itemsSold, avatarUrl } = body;

    // Prepare updates object
    const updates: any = {};

    // Validate and sanitize username if provided
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        return NextResponse.json(
          { error: 'Username cannot be empty', code: 'INVALID_USERNAME' },
          { status: 400 }
        );
      }

      // Check for duplicate username (exclude current seller)
      const duplicateUsername = await db
        .select()
        .from(sellers)
        .where(eq(sellers.username, trimmedUsername))
        .limit(1);

      if (
        duplicateUsername.length > 0 &&
        duplicateUsername[0].id !== sellerId
      ) {
        return NextResponse.json(
          { error: 'Username already exists', code: 'DUPLICATE_USERNAME' },
          { status: 400 }
        );
      }

      updates.username = trimmedUsername;
    }

    // Validate and sanitize email if provided
    if (email !== undefined) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return NextResponse.json(
          { error: 'Email cannot be empty', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }

      if (!trimmedEmail.includes('@')) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }

      const sanitizedEmail = trimmedEmail.toLowerCase();

      // Check for duplicate email (exclude current seller)
      const duplicateEmail = await db
        .select()
        .from(sellers)
        .where(eq(sellers.email, sanitizedEmail))
        .limit(1);

      if (duplicateEmail.length > 0 && duplicateEmail[0].id !== sellerId) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
          { status: 400 }
        );
      }

      updates.email = sanitizedEmail;
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (rating < 0 || rating > 100) {
        return NextResponse.json(
          {
            error: 'Rating must be between 0 and 100',
            code: 'INVALID_RATING',
          },
          { status: 400 }
        );
      }
      updates.rating = rating;
    }

    // Update itemsSold if provided
    if (itemsSold !== undefined) {
      updates.itemsSold = itemsSold;
    }

    // Update avatarUrl if provided
    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl?.trim() || null;
    }

    // Update seller
    const updatedSeller = await db
      .update(sellers)
      .set(updates)
      .where(eq(sellers.id, sellerId))
      .returning();

    return NextResponse.json(updatedSeller[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const sellerId = parseInt(id);

    // Check if seller exists before deleting
    const existingSeller = await db
      .select()
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (existingSeller.length === 0) {
      return NextResponse.json(
        { error: 'Seller not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete seller
    const deleted = await db
      .delete(sellers)
      .where(eq(sellers.id, sellerId))
      .returning();

    return NextResponse.json(
      {
        message: 'Seller deleted successfully',
        id: deleted[0].id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}