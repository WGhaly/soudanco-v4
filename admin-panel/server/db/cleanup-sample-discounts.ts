import { db } from './index';
import { discounts, discountProducts } from './schema';
import { eq, or, inArray } from 'drizzle-orm';

// List of seeded/sample discount names to remove
const SAMPLE_DISCOUNT_NAMES = [
  'Summer Sale 15% Off',
  'تخفيضات الصيف 15%',
  'SAR 50 Off Orders Over 500',
  'خصم 50 ريال على الطلبات فوق 500',
  'Buy 10 Get 2 Free Cola',
  'اشتر 10 كولا واحصل على 2 مجاناً',
];

async function cleanupSampleDiscounts() {
  console.log('🧹 Cleaning up sample discounts...');

  try {
    // Find sample discounts by name
    const sampleDiscounts = await db
      .select({ id: discounts.id, name: discounts.name, nameAr: discounts.nameAr })
      .from(discounts)
      .where(
        or(
          inArray(discounts.name, SAMPLE_DISCOUNT_NAMES),
          inArray(discounts.nameAr, SAMPLE_DISCOUNT_NAMES)
        )
      );

    if (sampleDiscounts.length === 0) {
      console.log('✓ No sample discounts found to remove.');
      return;
    }

    console.log(`Found ${sampleDiscounts.length} sample discounts to remove:`);
    sampleDiscounts.forEach(d => console.log(`  - ${d.nameAr || d.name}`));

    const discountIds = sampleDiscounts.map(d => d.id);

    // Delete discount-product associations first
    await db.delete(discountProducts).where(inArray(discountProducts.discountId, discountIds));
    console.log('✓ Discount-product associations removed');

    // Delete the discounts
    await db.delete(discounts).where(inArray(discounts.id, discountIds));
    console.log('✓ Sample discounts removed');

    console.log('🎉 Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }

  process.exit(0);
}

cleanupSampleDiscounts();
