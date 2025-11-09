import { db } from '@/db';
import { payment } from '@/db/schema';

async function main() {
    const samplePayments = [
        {
            amount: 1299.99,
            type: 'credit_card',
            executedBy: 'John Smith',
            buyerId: 1,
        },
        {
            amount: 89.99,
            type: 'paypal',
            executedBy: 'John Smith',
            buyerId: 1,
        },
        {
            amount: 549.99,
            type: 'credit_card',
            executedBy: 'Sarah Johnson',
            buyerId: 2,
        },
        {
            amount: 199.99,
            type: 'paypal',
            executedBy: 'Michael Chen',
            buyerId: 3,
        },
        {
            amount: 750.00,
            type: 'bank_transfer',
            executedBy: 'Michael Chen',
            buyerId: 3,
        },
        {
            amount: 45.50,
            type: 'debit_card',
            executedBy: 'Emily Rodriguez',
            buyerId: 4,
        },
        {
            amount: 320.00,
            type: 'credit_card',
            executedBy: 'Emily Rodriguez',
            buyerId: 4,
        },
        {
            amount: 125.75,
            type: 'paypal',
            executedBy: 'David Park',
            buyerId: 5,
        },
        {
            amount: 899.99,
            type: 'credit_card',
            executedBy: 'David Park',
            buyerId: 5,
        },
        {
            amount: 67.99,
            type: 'paypal',
            executedBy: 'Lisa Anderson',
            buyerId: 6,
        },
        {
            amount: 450.00,
            type: 'credit_card',
            executedBy: 'Lisa Anderson',
            buyerId: 6,
        },
        {
            amount: 1150.00,
            type: 'bank_transfer',
            executedBy: 'James Wilson',
            buyerId: 7,
        },
        {
            amount: 299.99,
            type: 'credit_card',
            executedBy: 'James Wilson',
            buyerId: 7,
        },
        {
            amount: 88.50,
            type: 'paypal',
            executedBy: 'Maria Garcia',
            buyerId: 8,
        },
        {
            amount: 175.00,
            type: 'debit_card',
            executedBy: 'Maria Garcia',
            buyerId: 8,
        },
        {
            amount: 520.00,
            type: 'credit_card',
            executedBy: 'Robert Taylor',
            buyerId: 9,
        },
        {
            amount: 95.99,
            type: 'paypal',
            executedBy: 'Robert Taylor',
            buyerId: 9,
        },
        {
            amount: 35.00,
            type: 'debit_card',
            executedBy: 'Jennifer Lee',
            buyerId: 10,
        },
        {
            amount: 680.00,
            type: 'credit_card',
            executedBy: 'Jennifer Lee',
            buyerId: 10,
        },
        {
            amount: 145.99,
            type: 'paypal',
            executedBy: 'Jennifer Lee',
            buyerId: 10,
        },
    ];

    await db.insert(payment).values(samplePayments);
    
    console.log('✅ Payment seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});