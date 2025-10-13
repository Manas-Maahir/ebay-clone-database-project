import { db } from '@/db';
import { bids, products } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

async function main() {
    // Fetch products from Fashion (8), Toys (9), and Sports (10) categories
    const newProducts = await db.select().from(products).where(
        inArray(products.categoryId, [8, 9, 10])
    );

    if (newProducts.length === 0) {
        console.log('⚠️ No products found in Fashion, Toys, or Sports categories');
        return;
    }

    // Select approximately 50% of products to receive bids
    const productsWithBids = newProducts
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.ceil(newProducts.length * 0.5));

    const now = new Date();
    const sampleBids = [];

    for (const product of productsWithBids) {
        const startingPrice = product.price;
        let currentPrice = startingPrice;
        
        // Determine bid count and increment based on product price
        let bidCount: number;
        let baseIncrement: number;
        
        if (currentPrice >= 500) {
            bidCount = Math.floor(Math.random() * 3) + 4; // 4-6 bids
            baseIncrement = currentPrice > 1000 ? 50 : 30;
        } else if (currentPrice >= 100) {
            bidCount = Math.floor(Math.random() * 3) + 3; // 3-5 bids
            baseIncrement = 15;
        } else {
            bidCount = Math.floor(Math.random() * 3) + 2; // 2-4 bids
            baseIncrement = 5;
        }

        // Bidder names pool
        const bidderNames = [
            'fashion_lover_2024', 'toy_collector_pro', 'fitness_enthusiast',
            'sneaker_head_99', 'sports_gear_fan', 'deal_hunter_jane',
            'vintage_collector', 'outdoor_adventurer', 'basketball_dad',
            'yoga_mom_2024', 'lego_master', 'bike_rider_88',
            'luxury_shopper_23', 'bargain_hunter_77', 'collector_elite',
            'gym_rat_2024', 'fashionista_nyc', 'dad_shopper', 'mom_finds_deals',
            'sports_fanatic', 'retro_gamer_90s', 'sneaker_collector'
        ];

        // Generate bids with realistic timing and increments
        for (let i = 0; i < bidCount; i++) {
            // Calculate days ago (earlier bids = more days ago)
            const daysAgo = bidCount - i - 1;
            const hoursAgo = Math.random() * 24;
            const bidDate = new Date(now);
            bidDate.setDate(bidDate.getDate() - daysAgo);
            bidDate.setHours(bidDate.getHours() - hoursAgo);

            // Calculate bid increment with some variation
            const incrementVariation = Math.random() * 0.5 + 0.75; // 0.75x to 1.25x
            const increment = baseIncrement * incrementVariation;
            currentPrice += increment;

            // Select random bidder (avoid same bidder twice in a row)
            let bidderName = bidderNames[Math.floor(Math.random() * bidderNames.length)];
            if (i > 0 && sampleBids[sampleBids.length - 1].productId === product.id) {
                const lastBidder = sampleBids[sampleBids.length - 1].bidderName;
                while (bidderName === lastBidder) {
                    bidderName = bidderNames[Math.floor(Math.random() * bidderNames.length)];
                }
            }

            sampleBids.push({
                productId: product.id,
                bidderName: bidderName,
                amount: Math.round(currentPrice * 100) / 100,
                createdAt: bidDate.toISOString(),
            });
        }

        // Update product's current price to the latest bid amount
        await db.update(products)
            .set({ price: Math.round(currentPrice * 100) / 100 })
            .where(eq(products.id, product.id));
    }

    // Insert all bids
    if (sampleBids.length > 0) {
        await db.insert(bids).values(sampleBids);
        console.log(`✅ Bids seeder completed successfully - Added ${sampleBids.length} bids for ${productsWithBids.length} products`);
    } else {
        console.log('⚠️ No bids generated');
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});