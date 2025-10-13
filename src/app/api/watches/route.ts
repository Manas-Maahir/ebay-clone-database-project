import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watches, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const watcherName = searchParams.get('watcher_name');
    const productId = searchParams.get('product_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate that at least one parameter is provided
    if (!watcherName && !productId) {
      return NextResponse.json(
        { 
          error: 'Either watcher_name or product_id parameter is required',
          code: 'MISSING_REQUIRED_PARAMETER'
        },
        { status: 400 }
      );
    }

    // Build query conditions based on provided parameters
    const conditions = [];
    
    if (watcherName) {
      conditions.push(eq(watches.watcherName, watcherName));
    }
    
    if (productId) {
      const parsedProductId = parseInt(productId);
      if (isNaN(parsedProductId)) {
        return NextResponse.json(
          { 
            error: 'product_id must be a valid integer',
            code: 'INVALID_PRODUCT_ID'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(watches.productId, parsedProductId));
    }

    // Execute query with combined conditions
    const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
    
    const results = await db.select()
      .from(watches)
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

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
    const { productId, watcherName } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { 
          error: 'productId is required',
          code: 'MISSING_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    if (!watcherName) {
      return NextResponse.json(
        { 
          error: 'watcherName is required',
          code: 'MISSING_WATCHER_NAME'
        },
        { status: 400 }
      );
    }

    // Validate productId is valid integer
    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId)) {
      return NextResponse.json(
        { 
          error: 'productId must be a valid integer',
          code: 'INVALID_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    // Sanitize watcherName
    const trimmedWatcherName = watcherName.trim();
    if (!trimmedWatcherName) {
      return NextResponse.json(
        { 
          error: 'watcherName must be non-empty after trimming',
          code: 'INVALID_WATCHER_NAME'
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parsedProductId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 400 }
      );
    }

    // Check if user already watching this product (prevent duplicates)
    const existingWatch = await db.select()
      .from(watches)
      .where(
        and(
          eq(watches.productId, parsedProductId),
          eq(watches.watcherName, trimmedWatcherName)
        )
      )
      .limit(1);

    if (existingWatch.length > 0) {
      return NextResponse.json(
        { 
          error: 'Already watching this product',
          code: 'DUPLICATE_WATCH'
        },
        { status: 400 }
      );
    }

    // Create new watch
    const newWatch = await db.insert(watches)
      .values({
        productId: parsedProductId,
        watcherName: trimmedWatcherName,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newWatch[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID is provided and is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // Check if watch exists before deleting
    const existingWatch = await db.select()
      .from(watches)
      .where(eq(watches.id, parsedId))
      .limit(1);

    if (existingWatch.length === 0) {
      return NextResponse.json(
        { 
          error: 'Watch not found',
          code: 'WATCH_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete the watch
    const deleted = await db.delete(watches)
      .where(eq(watches.id, parsedId))
      .returning();

    return NextResponse.json(
      {
        message: 'Watch removed successfully',
        id: deleted[0].id
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