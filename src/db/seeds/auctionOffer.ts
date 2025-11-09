import { db } from '@/db';
import { auctionOffer } from '@/db/schema';

async function main() {
    const sampleAuctionOffers = [
        {
            minPrice: 499.99,
            winnerName: 'Michael Chen',
            bidId: 1,
        },
        {
            minPrice: 299.99,
            winnerName: 'Sarah Johnson',
            bidId: 2,
        },
        {
            minPrice: 149.99,
            winnerName: 'David Martinez',
            bidId: 3,
        },
        {
            minPrice: 89.99,
            winnerName: 'Emily Rodriguez',
            bidId: 4,
        },
        {
            minPrice: 199.99,
            winnerName: 'James Wilson',
            bidId: 5,
        },
        {
            minPrice: 79.99,
            winnerName: 'Lisa Anderson',
            bidId: 6,
        },
        {
            minPrice: 349.99,
            winnerName: 'Robert Taylor',
            bidId: 7,
        },
        {
            minPrice: 124.99,
            winnerName: 'Jennifer Lee',
            bidId: 8,
        },
        {
            minPrice: 59.99,
            winnerName: 'Christopher Brown',
            bidId: 9,
        },
        {
            minPrice: 449.99,
            winnerName: 'Amanda Garcia',
            bidId: 10,
        },
    ];

    await db.insert(auctionOffer).values(sampleAuctionOffers);
    
    console.log('✅ Auction offers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});