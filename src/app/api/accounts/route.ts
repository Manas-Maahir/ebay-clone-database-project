import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account, userAccount } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single account by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db.select()
        .from(account)
        .where(eq(account.id, parseInt(id)))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ 
          error: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(result[0], { status: 200 });
    }

    // List accounts with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(account);

    if (search) {
      query = query.where(
        like(account.username, `%${search}%`)
      );
    }

    const results = await query.limit(limit).offset(offset);

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
    const { username, password, type, userId } = body;

    // Validate required fields
    if (!username || !password || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: username, password, and type are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();
    const sanitizedType = type.trim();

    if (!sanitizedUsername || !sanitizedPassword || !sanitizedType) {
      return NextResponse.json({ 
        error: "Fields cannot be empty after trimming",
        code: "EMPTY_FIELDS" 
      }, { status: 400 });
    }

    // Check username uniqueness
    const existingAccount = await db.select()
      .from(account)
      .where(eq(account.username, sanitizedUsername))
      .limit(1);

    if (existingAccount.length > 0) {
      return NextResponse.json({ 
        error: "Username already exists",
        code: "DUPLICATE_USERNAME" 
      }, { status: 400 });
    }

    // Validate userId exists if provided
    if (userId !== undefined && userId !== null) {
      const existingUser = await db.select()
        .from(userAccount)
        .where(eq(userAccount.id, parseInt(userId)))
        .limit(1);

      if (existingUser.length === 0) {
        return NextResponse.json({ 
          error: "Referenced user does not exist",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
    }

    // Create new account
    const newAccount = await db.insert(account)
      .values({
        username: sanitizedUsername,
        password: sanitizedPassword,
        type: sanitizedType,
        userId: userId !== undefined && userId !== null ? parseInt(userId) : null
      })
      .returning();

    return NextResponse.json(newAccount[0], { status: 201 });

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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const accountId = parseInt(id);

    // Check if account exists
    const existingAccount = await db.select()
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json({ 
        error: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { username, password, type, userId } = body;

    // Prepare updates object
    const updates: any = {};

    // Handle username update with uniqueness check
    if (username !== undefined) {
      const sanitizedUsername = username.trim();
      
      if (!sanitizedUsername) {
        return NextResponse.json({ 
          error: "Username cannot be empty",
          code: "EMPTY_USERNAME" 
        }, { status: 400 });
      }

      // Check username uniqueness (excluding current account)
      const duplicateUsername = await db.select()
        .from(account)
        .where(
          and(
            eq(account.username, sanitizedUsername),
            eq(account.id, accountId)
          )
        )
        .limit(1);

      // If no result with same id, check if username exists elsewhere
      if (duplicateUsername.length === 0) {
        const otherAccount = await db.select()
          .from(account)
          .where(eq(account.username, sanitizedUsername))
          .limit(1);

        if (otherAccount.length > 0) {
          return NextResponse.json({ 
            error: "Username already exists",
            code: "DUPLICATE_USERNAME" 
          }, { status: 400 });
        }
      }

      updates.username = sanitizedUsername;
    }

    // Handle password update
    if (password !== undefined) {
      const sanitizedPassword = password.trim();
      
      if (!sanitizedPassword) {
        return NextResponse.json({ 
          error: "Password cannot be empty",
          code: "EMPTY_PASSWORD" 
        }, { status: 400 });
      }

      updates.password = sanitizedPassword;
    }

    // Handle type update
    if (type !== undefined) {
      const sanitizedType = type.trim();
      
      if (!sanitizedType) {
        return NextResponse.json({ 
          error: "Type cannot be empty",
          code: "EMPTY_TYPE" 
        }, { status: 400 });
      }

      updates.type = sanitizedType;
    }

    // Handle userId update
    if (userId !== undefined) {
      if (userId !== null) {
        // Validate userId exists
        const existingUser = await db.select()
          .from(userAccount)
          .where(eq(userAccount.id, parseInt(userId)))
          .limit(1);

        if (existingUser.length === 0) {
          return NextResponse.json({ 
            error: "Referenced user does not exist",
            code: "INVALID_USER_ID" 
          }, { status: 400 });
        }

        updates.userId = parseInt(userId);
      } else {
        updates.userId = null;
      }
    }

    // If no updates, return current account
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingAccount[0], { status: 200 });
    }

    // Update account
    const updatedAccount = await db.update(account)
      .set(updates)
      .where(eq(account.id, accountId))
      .returning();

    return NextResponse.json(updatedAccount[0], { status: 200 });

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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const accountId = parseInt(id);

    // Check if account exists
    const existingAccount = await db.select()
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json({ 
        error: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete account
    const deleted = await db.delete(account)
      .where(eq(account.id, accountId))
      .returning();

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      account: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}