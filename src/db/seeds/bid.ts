import { db } from '@/db';
import { bid } from '@/db/schema';

async function main() {
    const sampleBids = [
        // Product 1 - High competition (5 bids)
        { amount: 525.00, bidDate: new Date('2024-11-15T10:30:00Z').toISOString(), buyerId: 1, productId: 1 },
        { amount: 550.00, bidDate: new Date('2024-11-18T14:20:00Z').toISOString(), buyerId: 3, productId: 1 },
        { amount: 575.00, bidDate: new Date('2024-11-22T09:15:00Z').toISOString(), buyerId: 5, productId: 1 },
        { amount: 600.00, bidDate: new Date('2024-11-28T16:45:00Z').toISOString(), buyerId: 7, productId: 1 },
        { amount: 625.00, bidDate: new Date('2024-12-05T11:30:00Z').toISOString(), buyerId: 2, productId: 1 },

        // Product 2 - High competition (4 bids)
        { amount: 315.00, bidDate: new Date('2024-11-16T08:00:00Z').toISOString(), buyerId: 2, productId: 2 },
        { amount: 335.00, bidDate: new Date('2024-11-20T13:30:00Z').toISOString(), buyerId: 4, productId: 2 },
        { amount: 355.00, bidDate: new Date('2024-11-26T10:45:00Z').toISOString(), buyerId: 6, productId: 2 },
        { amount: 370.00, bidDate: new Date('2024-12-03T15:20:00Z').toISOString(), buyerId: 8, productId: 2 },

        // Product 3 - High competition (5 bids)
        { amount: 1050.00, bidDate: new Date('2024-11-14T09:00:00Z').toISOString(), buyerId: 3, productId: 3 },
        { amount: 1100.00, bidDate: new Date('2024-11-19T12:30:00Z').toISOString(), buyerId: 1, productId: 3 },
        { amount: 1150.00, bidDate: new Date('2024-11-24T14:15:00Z').toISOString(), buyerId: 5, productId: 3 },
        { amount: 1200.00, bidDate: new Date('2024-11-30T10:00:00Z').toISOString(), buyerId: 9, productId: 3 },
        { amount: 1250.00, bidDate: new Date('2024-12-06T16:30:00Z').toISOString(), buyerId: 4, productId: 3 },

        // Product 4 - High competition (4 bids)
        { amount: 160.00, bidDate: new Date('2024-11-17T11:00:00Z').toISOString(), buyerId: 4, productId: 4 },
        { amount: 170.00, bidDate: new Date('2024-11-23T15:30:00Z').toISOString(), buyerId: 2, productId: 4 },
        { amount: 180.00, bidDate: new Date('2024-11-29T09:45:00Z').toISOString(), buyerId: 6, productId: 4 },
        { amount: 190.00, bidDate: new Date('2024-12-04T13:15:00Z').toISOString(), buyerId: 10, productId: 4 },

        // Product 5 - High competition (3 bids)
        { amount: 210.00, bidDate: new Date('2024-11-18T10:30:00Z').toISOString(), buyerId: 5, productId: 5 },
        { amount: 225.00, bidDate: new Date('2024-11-25T14:00:00Z').toISOString(), buyerId: 7, productId: 5 },
        { amount: 240.00, bidDate: new Date('2024-12-02T11:45:00Z').toISOString(), buyerId: 3, productId: 5 },

        // Product 6 - High competition (4 bids)
        { amount: 53.00, bidDate: new Date('2024-11-16T09:15:00Z').toISOString(), buyerId: 6, productId: 6 },
        { amount: 56.00, bidDate: new Date('2024-11-21T13:45:00Z').toISOString(), buyerId: 1, productId: 6 },
        { amount: 59.00, bidDate: new Date('2024-11-27T10:30:00Z').toISOString(), buyerId: 8, productId: 6 },
        { amount: 62.00, bidDate: new Date('2024-12-05T15:00:00Z').toISOString(), buyerId: 4, productId: 6 },

        // Product 7 - High competition (3 bids)
        { amount: 420.00, bidDate: new Date('2024-11-19T08:30:00Z').toISOString(), buyerId: 7, productId: 7 },
        { amount: 445.00, bidDate: new Date('2024-11-26T12:15:00Z').toISOString(), buyerId: 9, productId: 7 },
        { amount: 470.00, bidDate: new Date('2024-12-03T09:45:00Z').toISOString(), buyerId: 2, productId: 7 },

        // Product 8 - High competition (5 bids)
        { amount: 840.00, bidDate: new Date('2024-11-15T11:00:00Z').toISOString(), buyerId: 8, productId: 8 },
        { amount: 880.00, bidDate: new Date('2024-11-20T14:30:00Z').toISOString(), buyerId: 3, productId: 8 },
        { amount: 920.00, bidDate: new Date('2024-11-25T10:15:00Z').toISOString(), buyerId: 5, productId: 8 },
        { amount: 960.00, bidDate: new Date('2024-12-01T13:45:00Z').toISOString(), buyerId: 10, productId: 8 },
        { amount: 1000.00, bidDate: new Date('2024-12-06T11:20:00Z').toISOString(), buyerId: 1, productId: 8 },

        // Product 9 - Moderate competition (2 bids)
        { amount: 265.00, bidDate: new Date('2024-11-22T09:00:00Z').toISOString(), buyerId: 9, productId: 9 },
        { amount: 285.00, bidDate: new Date('2024-12-04T14:30:00Z').toISOString(), buyerId: 6, productId: 9 },

        // Product 10 - Moderate competition (3 bids)
        { amount: 32.00, bidDate: new Date('2024-11-17T10:45:00Z').toISOString(), buyerId: 10, productId: 10 },
        { amount: 34.00, bidDate: new Date('2024-11-24T15:20:00Z').toISOString(), buyerId: 4, productId: 10 },
        { amount: 36.00, bidDate: new Date('2024-12-02T12:00:00Z').toISOString(), buyerId: 7, productId: 10 },

        // Product 11 - Moderate competition (2 bids)
        { amount: 158.00, bidDate: new Date('2024-11-20T11:30:00Z').toISOString(), buyerId: 1, productId: 11 },
        { amount: 168.00, bidDate: new Date('2024-12-01T16:00:00Z').toISOString(), buyerId: 8, productId: 11 },

        // Product 12 - Moderate competition (3 bids)
        { amount: 630.00, bidDate: new Date('2024-11-18T09:45:00Z').toISOString(), buyerId: 2, productId: 12 },
        { amount: 665.00, bidDate: new Date('2024-11-27T13:15:00Z').toISOString(), buyerId: 5, productId: 12 },
        { amount: 700.00, bidDate: new Date('2024-12-05T10:30:00Z').toISOString(), buyerId: 9, productId: 12 },

        // Product 13 - Moderate competition (2 bids)
        { amount: 1155.00, bidDate: new Date('2024-11-21T08:15:00Z').toISOString(), buyerId: 3, productId: 13 },
        { amount: 1225.00, bidDate: new Date('2024-12-03T14:45:00Z').toISOString(), buyerId: 6, productId: 13 },

        // Product 14 - Moderate competition (2 bids)
        { amount: 105.00, bidDate: new Date('2024-11-23T10:00:00Z').toISOString(), buyerId: 4, productId: 14 },
        { amount: 115.00, bidDate: new Date('2024-12-04T15:30:00Z').toISOString(), buyerId: 1, productId: 14 },

        // Product 15 - Moderate competition (3 bids)
        { amount: 420.00, bidDate: new Date('2024-11-19T11:45:00Z').toISOString(), buyerId: 5, productId: 15 },
        { amount: 445.00, bidDate: new Date('2024-11-28T09:20:00Z').toISOString(), buyerId: 8, productId: 15 },
        { amount: 470.00, bidDate: new Date('2024-12-06T13:00:00Z').toISOString(), buyerId: 2, productId: 15 },

        // Product 16 - Low-moderate competition (2 bids)
        { amount: 1680.00, bidDate: new Date('2024-11-25T10:30:00Z').toISOString(), buyerId: 7, productId: 16 },
        { amount: 1750.00, bidDate: new Date('2024-12-05T14:15:00Z').toISOString(), buyerId: 10, productId: 16 },

        // Product 17 - Low-moderate competition (1 bid)
        { amount: 53.00, bidDate: new Date('2024-11-26T12:00:00Z').toISOString(), buyerId: 3, productId: 17 },

        // Product 18 - Low-moderate competition (2 bids)
        { amount: 84.00, bidDate: new Date('2024-11-22T09:30:00Z').toISOString(), buyerId: 6, productId: 18 },
        { amount: 90.00, bidDate: new Date('2024-12-02T15:45:00Z').toISOString(), buyerId: 9, productId: 18 },

        // Product 19 - Low-moderate competition (1 bid)
        { amount: 315.00, bidDate: new Date('2024-11-29T11:15:00Z').toISOString(), buyerId: 4, productId: 19 },

        // Product 20 - Low-moderate competition (2 bids)
        { amount: 420.00, bidDate: new Date('2024-11-24T08:45:00Z').toISOString(), buyerId: 1, productId: 20 },
        { amount: 445.00, bidDate: new Date('2024-12-04T13:30:00Z').toISOString(), buyerId: 7, productId: 20 }
    ];

    await db.insert(bid).values(sampleBids);
    
    console.log('✅ Bid seeder completed successfully - 50 bids created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});