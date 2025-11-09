import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payment, buyer } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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
        .from(payment)
        .where(eq(payment.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Payment not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const buyerIdParam = searchParams.get('buyer_id');
    const typeParam = searchParams.get('type');

    let query = db.select().from(payment);
    const conditions = [];

    if (buyerIdParam) {
      const buyerIdValue = parseInt(buyerIdParam);
      if (!isNaN(buyerIdValue)) {
        conditions.push(eq(payment.buyerId, buyerIdValue));
      }
    }

    if (typeParam) {
      conditions.push(eq(payment.type, typeParam.trim()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
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
    const { amount, type, executedBy, buyerId } = body;

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (!executedBy) {
      return NextResponse.json(
        { error: 'ExecutedBy is required', code: 'MISSING_EXECUTED_BY' },
        { status: 400 }
      );
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (buyerId !== undefined && buyerId !== null) {
      const buyerIdValue = parseInt(buyerId);
      if (isNaN(buyerIdValue)) {
        return NextResponse.json(
          { error: 'Invalid buyer ID', code: 'INVALID_BUYER_ID' },
          { status: 400 }
        );
      }

      const existingBuyer = await db
        .select()
        .from(buyer)
        .where(eq(buyer.id, buyerIdValue))
        .limit(1);

      if (existingBuyer.length === 0) {
        return NextResponse.json(
          { error: 'Buyer not found', code: 'BUYER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    const insertData: {
      amount: number;
      type: string;
      executedBy: string;
      buyerId?: number;
    } = {
      amount: amountValue,
      type: type.trim(),
      executedBy: executedBy.trim(),
    };

    if (buyerId !== undefined && buyerId !== null) {
      insertData.buyerId = parseInt(buyerId);
    }

    const newPayment = await db.insert(payment).values(insertData).returning();

    return NextResponse.json(newPayment[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(payment)
      .where(eq(payment.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, type, executedBy, buyerId } = body;

    const updates: {
      amount?: number;
      type?: string;
      executedBy?: string;
      buyerId?: number | null;
    } = {};

    if (amount !== undefined) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      updates.amount = amountValue;
    }

    if (type !== undefined) {
      updates.type = type.trim();
    }

    if (executedBy !== undefined) {
      updates.executedBy = executedBy.trim();
    }

    if (buyerId !== undefined) {
      if (buyerId === null) {
        updates.buyerId = null;
      } else {
        const buyerIdValue = parseInt(buyerId);
        if (isNaN(buyerIdValue)) {
          return NextResponse.json(
            { error: 'Invalid buyer ID', code: 'INVALID_BUYER_ID' },
            { status: 400 }
          );
        }

        const existingBuyer = await db
          .select()
          .from(buyer)
          .where(eq(buyer.id, buyerIdValue))
          .limit(1);

        if (existingBuyer.length === 0) {
          return NextResponse.json(
            { error: 'Buyer not found', code: 'BUYER_NOT_FOUND' },
            { status: 400 }
          );
        }

        updates.buyerId = buyerIdValue;
      }
    }

    const updated = await db
      .update(payment)
      .set(updates)
      .where(eq(payment.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(payment)
      .where(eq(payment.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(payment)
      .where(eq(payment.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Payment deleted successfully',
        payment: deleted[0],
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