import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Query category by ID
    const categoryResult = await db
      .select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    // Check if category exists
    if (categoryResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Category not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const category = categoryResult[0];

    // Query all products for this category
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, parseInt(id)));

    // Return combined response
    return NextResponse.json(
      {
        category,
        products: categoryProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}