import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAccount } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(userAccount)
        .where(eq(userAccount.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'User account not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(userAccount);

    if (search) {
      const searchTerm = search.trim();
      query = query.where(
        or(
          like(userAccount.name, `%${searchTerm}%`),
          like(userAccount.email, `%${searchTerm}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

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
    const { name, email, ssn, age, phone, address, nationality, birthdate } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const insertData: Record<string, any> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    if (ssn !== undefined && ssn !== null) {
      insertData.ssn = typeof ssn === 'string' ? ssn.trim() : ssn;
    }

    if (age !== undefined && age !== null) {
      if (typeof age !== 'number' || age < 0) {
        return NextResponse.json(
          { error: 'Age must be a positive number', code: 'INVALID_AGE' },
          { status: 400 }
        );
      }
      insertData.age = age;
    }

    if (phone !== undefined && phone !== null) {
      insertData.phone = typeof phone === 'string' ? phone.trim() : phone;
    }

    if (address !== undefined && address !== null) {
      insertData.address = typeof address === 'string' ? address.trim() : address;
    }

    if (nationality !== undefined && nationality !== null) {
      insertData.nationality = typeof nationality === 'string' ? nationality.trim() : nationality;
    }

    if (birthdate !== undefined && birthdate !== null) {
      insertData.birthdate = typeof birthdate === 'string' ? birthdate.trim() : birthdate;
    }

    const newRecord = await db.insert(userAccount).values(insertData).returning();

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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(userAccount)
      .where(eq(userAccount.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'User account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, ssn, age, phone, address, nationality, birthdate } = body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || email.trim().length === 0) {
        return NextResponse.json(
          { error: 'Email cannot be empty', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      if (!email.includes('@')) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
          { status: 400 }
        );
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (ssn !== undefined) {
      updateData.ssn = ssn === null ? null : (typeof ssn === 'string' ? ssn.trim() : ssn);
    }

    if (age !== undefined) {
      if (age !== null && (typeof age !== 'number' || age < 0)) {
        return NextResponse.json(
          { error: 'Age must be a positive number', code: 'INVALID_AGE' },
          { status: 400 }
        );
      }
      updateData.age = age;
    }

    if (phone !== undefined) {
      updateData.phone = phone === null ? null : (typeof phone === 'string' ? phone.trim() : phone);
    }

    if (address !== undefined) {
      updateData.address = address === null ? null : (typeof address === 'string' ? address.trim() : address);
    }

    if (nationality !== undefined) {
      updateData.nationality = nationality === null ? null : (typeof nationality === 'string' ? nationality.trim() : nationality);
    }

    if (birthdate !== undefined) {
      updateData.birthdate = birthdate === null ? null : (typeof birthdate === 'string' ? birthdate.trim() : birthdate);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(userAccount)
      .set(updateData)
      .where(eq(userAccount.id, parseInt(id)))
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(userAccount)
      .where(eq(userAccount.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'User account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(userAccount)
      .where(eq(userAccount.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'User account deleted successfully',
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