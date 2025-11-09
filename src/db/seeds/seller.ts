import { db } from '@/db';
import { seller } from '@/db/schema';

async function main() {
    const sampleSellers = [
        {
            userId: 6,
        },
        {
            userId: 7,
        },
        {
            userId: 8,
        },
        {
            userId: 9,
        },
        {
            userId: 10,
        },
        {
            userId: 16,
        },
        {
            userId: 17,
        },
        {
            userId: 18,
        },
        {
            userId: 19,
        },
        {
            userId: 20,
        }
    ];

    await db.insert(seller).values(sampleSellers);
    
    console.log('✅ Seller seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});