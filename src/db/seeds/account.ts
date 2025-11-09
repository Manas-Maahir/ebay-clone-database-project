import { db } from '@/db';
import { account } from '@/db/schema';

async function main() {
    const sampleAccounts = [
        {
            username: 'john_doe',
            password: 'password123',
            type: 'buyer',
            userId: 1,
        },
        {
            username: 'jane_smith',
            password: 'password123',
            type: 'buyer',
            userId: 2,
        },
        {
            username: 'mike_wilson',
            password: 'password123',
            type: 'seller',
            userId: 3,
        },
        {
            username: 'sarah_jones',
            password: 'password123',
            type: 'both',
            userId: 4,
        },
        {
            username: 'david_brown',
            password: 'password123',
            type: 'buyer',
            userId: 5,
        },
        {
            username: 'emily_davis',
            password: 'password123',
            type: 'buyer',
            userId: 6,
        },
        {
            username: 'james_miller',
            password: 'password123',
            type: 'seller',
            userId: 7,
        },
        {
            username: 'lisa_garcia',
            password: 'password123',
            type: 'both',
            userId: 8,
        },
        {
            username: 'robert_martinez',
            password: 'password123',
            type: 'buyer',
            userId: 9,
        },
        {
            username: 'jennifer_rodriguez',
            password: 'password123',
            type: 'buyer',
            userId: 10,
        },
        {
            username: 'william_lee',
            password: 'password123',
            type: 'seller',
            userId: 11,
        },
        {
            username: 'amanda_white',
            password: 'password123',
            type: 'both',
            userId: 12,
        },
        {
            username: 'chris_harris',
            password: 'password123',
            type: 'buyer',
            userId: 13,
        },
        {
            username: 'nicole_clark',
            password: 'password123',
            type: 'buyer',
            userId: 14,
        },
        {
            username: 'kevin_lewis',
            password: 'password123',
            type: 'seller',
            userId: 15,
        },
        {
            username: 'rachel_walker',
            password: 'password123',
            type: 'both',
            userId: 16,
        },
        {
            username: 'daniel_hall',
            password: 'password123',
            type: 'buyer',
            userId: 17,
        },
        {
            username: 'jessica_allen',
            password: 'password123',
            type: 'buyer',
            userId: 18,
        },
        {
            username: 'thomas_young',
            password: 'password123',
            type: 'seller',
            userId: 19,
        },
        {
            username: 'michelle_king',
            password: 'password123',
            type: 'both',
            userId: 20,
        },
    ];

    await db.insert(account).values(sampleAccounts);
    
    console.log('✅ Account seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});