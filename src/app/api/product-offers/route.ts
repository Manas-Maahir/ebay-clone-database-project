import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productOffer, seller } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(productOffer)
        .where(eq(productOffer.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const sellerId = searchParams.get('seller_id');

    let conditions = [];

    // Search by productName or description
    if (search) {
      conditions.push(
        or(
          like(productOffer.productName, `%${search}%`),
          like(productOffer.description, `%${search}%`)
        )
      );
    }

    // Filter by sellerId
    if (sellerId && !isNaN(parseInt(sellerId))) {
      conditions.push(eq(productOffer.sellerId, parseInt(sellerId)));
    }

    let query = db.select().from(productOffer);

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.productName || body.productName.trim() === '') {
      return NextResponse.json({ 
        error: "Product name is required",
        code: "MISSING_PRODUCT_NAME" 
      }, { status: 400 });
    }

    if (body.quantity === undefined || body.quantity === null) {
      return NextResponse.json({ 
        error: "Quantity is required",
        code: "MISSING_QUANTITY" 
      }, { status: 400 });
    }

    if (body.price === undefined || body.price === null) {
      return NextResponse.json({ 
        error: "Price is required",
        code: "MISSING_PRICE" 
      }, { status: 400 });
    }

    // Validate price and quantity
    if (body.price <= 0) {
      return NextResponse.json({ 
        error: "Price must be greater than 0",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (body.quantity < 0) {
      return NextResponse.json({ 
        error: "Quantity must be greater than or equal to 0",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    // Validate sellerId exists if provided
    if (body.sellerId) {
      const sellerExists = await db.select()
        .from(seller)
        .where(eq(seller.id, parseInt(body.sellerId)))
        .limit(1);

      if (sellerExists.length === 0) {
        return NextResponse.json({ 
          error: "Seller not found",
          code: "SELLER_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Sanitize inputs
    const productName = body.productName.trim();
    const description = body.description ? body.description.trim() : null;
    const keyword = body.keyword ? body.keyword.trim() : null;
    const shippingType = body.shippingType ? body.shippingType.trim() : null;

    // Prepare insert data
    const insertData = {
      title: productName,
      description: description,
      price: parseFloat(body.price),
      condition: keyword || 'new',
      shippingCost: shippingType ? parseFloat(shippingType) || 0 : 0,
      imageUrl: body.imageUrl || '/placeholder-image.jpg',
      status: 'active',
      views: 0,
      sellerId: body.sellerId ? parseInt(body.sellerId) : null,
      endsAt: body.dateExpiration || null,
      createdAt: new Date().toISOString()
    };

    const newRecord = await db.insert(productOffer)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(productOffer)
      .where(eq(productOffer.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.productName !== undefined) {
      if (body.productName.trim() === '') {
        return NextResponse.json({ 
          error: "Product name cannot be empty",
          code: "INVALID_PRODUCT_NAME" 
        }, { status: 400 });
      }
      updates.title = body.productName.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description ? body.description.trim() : null;
    }

    if (body.keyword !== undefined) {
      updates.condition = body.keyword ? body.keyword.trim() : 'new';
    }

    if (body.shippingType !== undefined) {
      updates.shippingCost = body.shippingType ? parseFloat(body.shippingType) || 0 : 0;
    }

    if (body.dateExpiration !== undefined) {
      updates.endsAt = body.dateExpiration || null;
    }

    if (body.quantity !== undefined) {
      if (body.quantity < 0) {
        return NextResponse.json({ 
          error: "Quantity must be greater than or equal to 0",
          code: "INVALID_QUANTITY" 
        }, { status: 400 });
      }
      updates.views = parseInt(body.quantity);
    }

    if (body.price !== undefined) {
      if (body.price <= 0) {
        return NextResponse.json({ 
          error: "Price must be greater than 0",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
      updates.price = parseFloat(body.price);
    }

    if (body.sellerId !== undefined) {
      if (body.sellerId) {
        const sellerExists = await db.select()
          .from(seller)
          .where(eq(seller.id, parseInt(body.sellerId)))
          .limit(1);

        if (sellerExists.length === 0) {
          return NextResponse.json({ 
            error: "Seller not found",
            code: "SELLER_NOT_FOUND" 
          }, { status: 400 });
        }
        updates.sellerId = parseInt(body.sellerId);
      } else {
        updates.sellerId = null;
      }
    }

    // Always update timestamp
    updates.createdAt = existing[0].createdAt;

    const updated = await db.update(productOffer)
      .set(updates)
      .where(eq(productOffer.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(productOffer)
      .where(eq(productOffer.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(productOffer)
      .where(eq(productOffer.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      deletedRecord: deleted[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}