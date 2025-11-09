import { db } from '@/db';
import { directBuy } from '@/db/schema';

async function main() {
    const sampleDirectBuys = [
        // Buyer 1 - Multiple purchases
        { productId: 11, buyerId: 1 },
        { productId: 15, buyerId: 1 },
        { productId: 22, buyerId: 1 },
        
        // Buyer 2 - Single purchase
        { productId: 12, buyerId: 2 },
        
        // Buyer 3 - Multiple purchases
        { productId: 13, buyerId: 3 },
        { productId: 18, buyerId: 3 },
        
        // Buyer 4 - Single purchase
        { productId: 14, buyerId: 4 },
        
        // Buyer 5 - Multiple purchases
        { productId: 16, buyerId: 5 },
        { productId: 24, buyerId: 5 },
        
        // Buyer 6 - Single purchase
        { productId: 17, buyerId: 6 },
        
        // Buyer 7 - Multiple purchases
        { productId: 19, buyerId: 7 },
        { productId: 26, buyerId: 7 },
        
        // Buyer 8 - Single purchase
        { productId: 20, buyerId: 8 },
        
        // Buyer 9 - Single purchase
        { productId: 21, buyerId: 9 },
        
        // Buyer 10 - Single purchase
        { productId: 23, buyerId: 10 }
    ];

    await db.insert(directBuy).values(sampleDirectBuys);
    
    console.log('✅ DirectBuy seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});