import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(categories);

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          like(categories.name, searchTerm),
          like(categories.slug, searchTerm)
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
    const { name, slug, description } = body;

    // Validate required fields
    const trimmedName = name?.trim();
    const trimmedSlug = slug?.trim().toLowerCase();

    if (!trimmedName || trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Name is required and cannot be empty', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!trimmedSlug || trimmedSlug.length === 0) {
      return NextResponse.json(
        { error: 'Slug is required and cannot be empty', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, trimmedSlug))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Slug already exists', code: 'DUPLICATE_SLUG' },
        { status: 400 }
      );
    }

    // Create new category
    const newCategory = await db
      .insert(categories)
      .values({
        name: trimmedName,
        slug: trimmedSlug,
        description: description?.trim() || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
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

    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, slug, description } = body;

    // Prepare update object
    const updates: any = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = trimmedName;
    }

    if (slug !== undefined) {
      const trimmedSlug = slug.trim().toLowerCase();
      if (trimmedSlug.length === 0) {
        return NextResponse.json(
          { error: 'Slug cannot be empty', code: 'INVALID_SLUG' },
          { status: 400 }
        );
      }

      // Check if slug is unique (excluding current category)
      if (trimmedSlug !== existingCategory[0].slug) {
        const duplicateSlug = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, trimmedSlug))
          .limit(1);

        if (duplicateSlug.length > 0) {
          return NextResponse.json(
            { error: 'Slug already exists', code: 'DUPLICATE_SLUG' },
            { status: 400 }
          );
        }
      }

      updates.slug = trimmedSlug;
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    // If no updates provided, return current category
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingCategory[0], { status: 200 });
    }

    // Update category
    const updatedCategory = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json(updatedCategory[0], { status: 200 });
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

    const categoryId = parseInt(id);

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete category
    await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json(
      { message: 'Category deleted successfully', id: categoryId },
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