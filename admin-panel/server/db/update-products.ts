import { db, products } from './index';
import { sql } from 'drizzle-orm';

async function updateProducts() {
  console.log('🔄 Starting product updates...');

  try {
    // Update all product descriptions that contain 350ml to 250ml
    const descriptionResult = await db.execute(sql`
      UPDATE products 
      SET description = REPLACE(description, '350ml', '250ml')
      WHERE description LIKE '%350ml%'
    `);
    console.log('✅ Updated product descriptions:', descriptionResult);

    // Update all product descriptions that contain 305ml to 250ml
    const description305Result = await db.execute(sql`
      UPDATE products 
      SET description = REPLACE(description, '305ml', '250ml')
      WHERE description LIKE '%305ml%'
    `);
    console.log('✅ Updated product descriptions (305ml):', description305Result);

    // Update all product descriptionAr that contain ٣٥٠ to ٢٥٠
    const descriptionArResult = await db.execute(sql`
      UPDATE products 
      SET description_ar = REPLACE(description_ar, '٣٥٠', '٢٥٠')
      WHERE description_ar LIKE '%٣٥٠%'
    `);
    console.log('✅ Updated Arabic product descriptions:', descriptionArResult);

    // Update all product units that contain 350 to 250
    const unitResult = await db.execute(sql`
      UPDATE products 
      SET unit = REPLACE(unit, '350', '250')
      WHERE unit LIKE '%350%'
    `);
    console.log('✅ Updated product units:', unitResult);

    // Update all product units that contain 305 to 250
    const unit305Result = await db.execute(sql`
      UPDATE products 
      SET unit = REPLACE(unit, '305', '250')
      WHERE unit LIKE '%305%'
    `);
    console.log('✅ Updated product units (305ml):', unit305Result);

    // Update image URLs that still reference 350ml or 305ml
    const imageResult = await db.execute(sql`
      UPDATE products 
      SET image_url = REPLACE(REPLACE(image_url, '350ml', '250ml'), '305ml', '250ml')
      WHERE image_url LIKE '%350ml%' OR image_url LIKE '%305ml%'
    `);
    console.log('✅ Updated product image URLs:', imageResult);

    // Update image URLs with 350-ml pattern
    const imageHyphenResult = await db.execute(sql`
      UPDATE products 
      SET image_url = REPLACE(image_url, '350-ml', '250-ml')
      WHERE image_url LIKE '%350-ml%'
    `);
    console.log('✅ Updated product image URLs (hyphenated):', imageHyphenResult);

    console.log('✨ All product updates completed successfully!');
  } catch (error) {
    console.error('❌ Error updating products:', error);
    throw error;
  }
}

updateProducts()
  .then(() => {
    console.log('✅ Update script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update script failed:', error);
    process.exit(1);
  });
