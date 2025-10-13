import { db } from '@/db';
import { sellers } from '@/db/schema';

async function main() {
    const sampleSellers = [
        {
            username: 'tech_deals_pro',
            email: 'techdeals@example.com',
            rating: 99.8,
            itemsSold: 1542,
            avatarUrl: null,
            joinedDate: new Date('2023-06-15').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'electronics_hub',
            email: 'electrohub@example.com',
            rating: 98.5,
            itemsSold: 987,
            avatarUrl: null,
            joinedDate: new Date('2023-08-22').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'gadget_store',
            email: 'gadgetstore@example.com',
            rating: 99.2,
            itemsSold: 2341,
            avatarUrl: null,
            joinedDate: new Date('2023-04-10').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'mobile_central',
            email: 'mobilecentral@example.com',
            rating: 97.8,
            itemsSold: 765,
            avatarUrl: null,
            joinedDate: new Date('2023-09-05').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'camera_world',
            email: 'cameraworld@example.com',
            rating: 99.5,
            itemsSold: 543,
            avatarUrl: null,
            joinedDate: new Date('2023-07-18').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'tech_kingdom',
            email: 'techkingdom@example.com',
            rating: 96.3,
            itemsSold: 432,
            avatarUrl: null,
            joinedDate: new Date('2023-11-12').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'smart_electronics',
            email: 'smartelec@example.com',
            rating: 98.9,
            itemsSold: 1234,
            avatarUrl: null,
            joinedDate: new Date('2023-05-28').toISOString(),
            createdAt: new Date().toISOString(),
        },
        {
            username: 'audio_pro_shop',
            email: 'audiopro@example.com',
            rating: 99.1,
            itemsSold: 876,
            avatarUrl: null,
            joinedDate: new Date('2023-10-03').toISOString(),
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(sellers).values(sampleSellers);
    
    console.log('✅ Sellers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});