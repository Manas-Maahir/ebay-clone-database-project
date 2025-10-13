import { db } from '@/db';
import { categories } from '@/db/schema';

async function main() {
    const newCategories = [
        {
            name: 'Fashion',
            slug: 'fashion',
            description: 'Clothing, shoes, accessories, and designer items',
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'Toys',
            slug: 'toys',
            description: 'Action figures, board games, educational toys, and collectibles',
            createdAt: new Date('2024-01-26').toISOString(),
        },
        {
            name: 'Sports',
            slug: 'sports',
            description: 'Exercise equipment, team sports gear, outdoor sports, and athletic apparel',
            createdAt: new Date('2024-01-27').toISOString(),
        }
    ];

    await db.insert(categories).values(newCategories);
    
    console.log('✅ Categories seeder completed successfully - Added 3 new categories');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});