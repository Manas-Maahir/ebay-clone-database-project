import { db } from '@/db';
import { buyer } from '@/db/schema';

async function main() {
    const sampleBuyers = [
        {
            userId: 1,
        },
        {
            userId: 2,
        },
        {
            userId: 3,
        },
        {
            userId: 4,
        },
        {
            userId: 5,
        },
        {
            userId: 11,
        },
        {
            userId: 12,
        },
        {
            userId: 13,
        },
        {
            userId: 14,
        },
        {
            userId: 15,
        }
    ];

    await db.insert(buyer).values(sampleBuyers);
    
    console.log('✅ Buyer seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});