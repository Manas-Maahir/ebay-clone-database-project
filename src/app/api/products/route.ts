import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, gte, lte, desc, asc } from 'drizzle-orm';

const VALID_CONDITIONS = ['new', 'used', 'refurbished'] as const;
const VALID_STATUSES = ['active', 'sold', 'expired'] as const;
const VALID_SORT_FIELDS = ['price', 'createdAt', 'views'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single product fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json(
          { error: 'Product not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(product[0], { status: 200 });
    }

    // List products with advanced filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category_id');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const status = searchParams.get('status');
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    // Build dynamic where conditions
    const conditions = [];

    if (search) {
      conditions.push(like(products.title, `%${search}%`));
    }

    if (categoryId) {
      const catId = parseInt(categoryId);
      if (!isNaN(catId)) {
        conditions.push(eq(products.categoryId, catId));
      }
    }

    if (condition) {
      conditions.push(eq(products.condition, condition));
    }

    if (status) {
      conditions.push(eq(products.status, status));
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        conditions.push(gte(products.price, min));
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        conditions.push(lte(products.price, max));
      }
    }

    // Build query
    let query = db.select().from(products);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn =
      sortField === 'price'
        ? products.price
        : sortField === 'views'
        ? products.views
        : products.createdAt;

    const sortDirection = sortOrder === 'asc' ? asc : desc;
    query = query.orderBy(sortDirection(sortColumn));

    // Apply pagination
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
    const {
      title,
      description,
      price,
      buyNowPrice,
      condition,
      shippingCost,
      imageUrl,
      status,
      sellerId,
      categoryId,
      endsAt,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!price) {
      return NextResponse.json(
        { error: 'Price is required', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (!condition) {
      return NextResponse.json(
        { error: 'Condition is required', code: 'MISSING_CONDITION' },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required', code: 'MISSING_IMAGE_URL' },
        { status: 400 }
      );
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required', code: 'MISSING_SELLER_ID' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required', code: 'MISSING_CATEGORY_ID' },
        { status: 400 }
      );
    }

    // Validate price is positive
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Validate condition
    if (!VALID_CONDITIONS.includes(condition)) {
      return NextResponse.json(
        {
          error: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
          code: 'INVALID_CONDITION',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedImageUrl = imageUrl.trim();

    // Prepare insert data with defaults
    const insertData = {
      title: sanitizedTitle,
      description: sanitizedDescription,
      price: priceNum,
      buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
      condition: condition,
      shippingCost: shippingCost !== undefined ? parseFloat(shippingCost) : 0,
      imageUrl: sanitizedImageUrl,
      status: status || 'active',
      sellerId: parseInt(sellerId),
      categoryId: parseInt(categoryId),
      views: 0,
      createdAt: new Date().toISOString(),
      endsAt: endsAt || null,
    };

    const newProduct = await db.insert(products).values(insertData).returning();

    return NextResponse.json(newProduct[0], { status: 201 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      buyNowPrice,
      condition,
      shippingCost,
      imageUrl,
      status,
      views,
      endsAt,
    } = body;

    // Validate price if provided
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
    }

    // Validate condition if provided
    if (condition && !VALID_CONDITIONS.includes(condition)) {
      return NextResponse.json(
        {
          error: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
          code: 'INVALID_CONDITION',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description ? description.trim() : null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (buyNowPrice !== undefined)
      updateData.buyNowPrice = buyNowPrice ? parseFloat(buyNowPrice) : null;
    if (condition !== undefined) updateData.condition = condition;
    if (shippingCost !== undefined)
      updateData.shippingCost = parseFloat(shippingCost);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (status !== undefined) updateData.status = status;
    if (views !== undefined) updateData.views = parseInt(views);
    if (endsAt !== undefined) updateData.endsAt = endsAt || null;

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        id: deleted[0].id,
        product: deleted[0],
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