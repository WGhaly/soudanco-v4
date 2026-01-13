import { db } from './index';
import {
  users,
  customers,
  customerAddresses,
  customerPaymentMethods,
  notifications,
  supervisors,
  categories,
  products,
  priceLists,
  priceListItems,
  discounts,
  discountProducts,
  orders,
  orderItems,
  payments,
} from './schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // ============================================
    // 0. CLEAN UP EXISTING DATA
    // ============================================
    console.log('Cleaning up existing data...');
    
    // Delete in order to respect foreign key constraints
    await db.delete(orderItems);
    await db.delete(payments);
    await db.delete(orders);
    await db.delete(notifications);
    await db.delete(customerPaymentMethods);
    await db.delete(customerAddresses);
    await db.delete(discountProducts);
    await db.delete(discounts);
    await db.delete(priceListItems);
    await db.delete(customers);
    await db.delete(supervisors);
    await db.delete(users);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(priceLists);
    
    console.log('✓ Existing data cleaned');

    // ============================================
    // 1. CREATE ADMIN USER
    // ============================================
    console.log('Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
      email: 'admin@soudanco.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
    }).returning();
    console.log('✓ Admin user created:', adminUser.email);

    // ============================================
    // 2. CREATE SUPERVISORS
    // ============================================
    console.log('Creating supervisors...');
    const supervisorPasswordHash = await bcrypt.hash('supervisor123', 10);
    
    const [supervisor1User] = await db.insert(users).values({
      email: 'ahmed.supervisor@soudanco.com',
      passwordHash: supervisorPasswordHash,
      role: 'supervisor',
      isActive: true,
    }).returning();

    const [supervisor1] = await db.insert(supervisors).values({
      userId: supervisor1User.id,
      name: 'Ahmed Al-Rashid',
      nameAr: 'أحمد الراشد',
      phone: '+966501234567',
      region: 'Riyadh',
      isActive: true,
    }).returning();

    const [supervisor2User] = await db.insert(users).values({
      email: 'fatima.supervisor@soudanco.com',
      passwordHash: supervisorPasswordHash,
      role: 'supervisor',
      isActive: true,
    }).returning();

    const [supervisor2] = await db.insert(supervisors).values({
      userId: supervisor2User.id,
      name: 'Fatima Al-Nasser',
      nameAr: 'فاطمة الناصر',
      phone: '+966509876543',
      region: 'Jeddah',
      isActive: true,
    }).returning();
    console.log('✓ Supervisors created');

    // ============================================
    // 3. CREATE PRICE LISTS
    // ============================================
    console.log('Creating price lists...');
    const [defaultPriceList] = await db.insert(priceLists).values({
      name: 'Standard Prices',
      nameAr: 'الأسعار القياسية',
      description: 'Default price list for regular customers',
      isDefault: true,
      isActive: true,
    }).returning();

    const [vipPriceList] = await db.insert(priceLists).values({
      name: 'VIP Prices',
      nameAr: 'أسعار كبار العملاء',
      description: 'Discounted prices for VIP customers',
      isDefault: false,
      isActive: true,
    }).returning();

    const [wholesalePriceList] = await db.insert(priceLists).values({
      name: 'Wholesale Prices',
      nameAr: 'أسعار الجملة',
      description: 'Bulk pricing for large orders',
      isDefault: false,
      isActive: true,
    }).returning();
    console.log('✓ Price lists created');

    // ============================================
    // 4. CREATE CATEGORIES
    // ============================================
    console.log('Creating categories...');
    const [sodaCategory] = await db.insert(categories).values({
      name: 'Soft Drinks',
      nameAr: 'المشروبات الغازية',
      slug: 'soft-drinks',
      description: 'Carbonated soft drinks',
      sortOrder: 1,
      isActive: true,
    }).returning();

    const [juiceCategory] = await db.insert(categories).values({
      name: 'Juices',
      nameAr: 'العصائر',
      slug: 'juices',
      description: 'Fresh and packaged juices',
      sortOrder: 2,
      isActive: true,
    }).returning();

    const [waterCategory] = await db.insert(categories).values({
      name: 'Water',
      nameAr: 'المياه',
      slug: 'water',
      description: 'Bottled water products',
      sortOrder: 3,
      isActive: true,
    }).returning();

    const [energyCategory] = await db.insert(categories).values({
      name: 'Energy Drinks',
      nameAr: 'مشروبات الطاقة',
      slug: 'energy-drinks',
      description: 'Energy and sports drinks',
      sortOrder: 4,
      isActive: true,
    }).returning();
    console.log('✓ Categories created');

    // ============================================
    // 5. CREATE PRODUCTS
    // ============================================
    console.log('Creating products...');
    const productData = [
      // Soft Drinks
      { sku: 'COLA-330', name: 'Cola 330ml', nameAr: 'كولا 330 مل', categoryId: sodaCategory.id, basePrice: '2.50', stockQuantity: 500, unitsPerCase: 24 },
      { sku: 'COLA-1L', name: 'Cola 1 Liter', nameAr: 'كولا 1 لتر', categoryId: sodaCategory.id, basePrice: '5.00', stockQuantity: 300, unitsPerCase: 12 },
      { sku: 'LEMON-330', name: 'Lemon Soda 330ml', nameAr: 'صودا ليمون 330 مل', categoryId: sodaCategory.id, basePrice: '2.50', stockQuantity: 400, unitsPerCase: 24 },
      { sku: 'ORANGE-330', name: 'Orange Soda 330ml', nameAr: 'صودا برتقال 330 مل', categoryId: sodaCategory.id, basePrice: '2.50', stockQuantity: 350, unitsPerCase: 24 },
      
      // Juices
      { sku: 'ORANGE-J-1L', name: 'Orange Juice 1L', nameAr: 'عصير برتقال 1 لتر', categoryId: juiceCategory.id, basePrice: '8.00', stockQuantity: 200, unitsPerCase: 12 },
      { sku: 'APPLE-J-1L', name: 'Apple Juice 1L', nameAr: 'عصير تفاح 1 لتر', categoryId: juiceCategory.id, basePrice: '8.00', stockQuantity: 180, unitsPerCase: 12 },
      { sku: 'MANGO-J-1L', name: 'Mango Juice 1L', nameAr: 'عصير مانجو 1 لتر', categoryId: juiceCategory.id, basePrice: '9.00', stockQuantity: 150, unitsPerCase: 12 },
      { sku: 'MIXED-J-250', name: 'Mixed Fruit Juice 250ml', nameAr: 'عصير فواكه مشكلة 250 مل', categoryId: juiceCategory.id, basePrice: '3.00', stockQuantity: 15, unitsPerCase: 24 },
      
      // Water
      { sku: 'WATER-500', name: 'Spring Water 500ml', nameAr: 'مياه معدنية 500 مل', categoryId: waterCategory.id, basePrice: '1.00', stockQuantity: 1000, unitsPerCase: 24 },
      { sku: 'WATER-1.5L', name: 'Spring Water 1.5L', nameAr: 'مياه معدنية 1.5 لتر', categoryId: waterCategory.id, basePrice: '2.00', stockQuantity: 600, unitsPerCase: 12 },
      { sku: 'WATER-5L', name: 'Spring Water 5L', nameAr: 'مياه معدنية 5 لتر', categoryId: waterCategory.id, basePrice: '5.00', stockQuantity: 0, unitsPerCase: 4 },
      
      // Energy Drinks
      { sku: 'ENERGY-250', name: 'Power Energy 250ml', nameAr: 'مشروب طاقة 250 مل', categoryId: energyCategory.id, basePrice: '6.00', stockQuantity: 250, unitsPerCase: 24 },
      { sku: 'ENERGY-500', name: 'Power Energy 500ml', nameAr: 'مشروب طاقة 500 مل', categoryId: energyCategory.id, basePrice: '10.00', stockQuantity: 8, unitsPerCase: 12 },
      { sku: 'SPORT-500', name: 'Sports Drink 500ml', nameAr: 'مشروب رياضي 500 مل', categoryId: energyCategory.id, basePrice: '7.00', stockQuantity: 180, unitsPerCase: 24 },
    ];

    const createdProducts: { id: string; sku: string; basePrice: string }[] = [];
    for (const product of productData) {
      // Calculate stock status
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (product.stockQuantity === 0) {
        stockStatus = 'out_of_stock';
      } else if (product.stockQuantity < 20) {
        stockStatus = 'low_stock';
      }

      const [created] = await db.insert(products).values({
        ...product,
        stockStatus,
        unit: 'case',
        lowStockThreshold: 10,
        isActive: true,
      }).returning();
      createdProducts.push({ id: created.id, sku: created.sku, basePrice: product.basePrice });
    }
    console.log(`✓ ${createdProducts.length} products created`);

    // ============================================
    // 6. CREATE PRICE LIST ITEMS
    // ============================================
    console.log('Creating price list items...');
    for (const product of createdProducts) {
      const basePrice = parseFloat(product.basePrice);
      
      // Standard prices (same as base)
      await db.insert(priceListItems).values({
        priceListId: defaultPriceList.id,
        productId: product.id,
        price: basePrice.toFixed(2),
      });

      // VIP prices (10% discount)
      await db.insert(priceListItems).values({
        priceListId: vipPriceList.id,
        productId: product.id,
        price: (basePrice * 0.9).toFixed(2),
      });

      // Wholesale prices (20% discount)
      await db.insert(priceListItems).values({
        priceListId: wholesalePriceList.id,
        productId: product.id,
        price: (basePrice * 0.8).toFixed(2),
      });
    }
    console.log('✓ Price list items created');

    // ============================================
    // 7. CREATE CUSTOMER USERS
    // ============================================
    console.log('Creating customers...');
    const customerPasswordHash = await bcrypt.hash('customer123', 10);

    // Customer 1 - Al-Jawhra Supermarket
    const [customer1User] = await db.insert(users).values({
      email: 'aljawhra@example.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
    }).returning();

    const [customer1] = await db.insert(customers).values({
      userId: customer1User.id,
      businessName: 'Al-Jawhra Supermarket',
      businessNameAr: 'سوبرماركت الجوهرة',
      contactName: 'Mohammed Al-Jawhra',
      phone: '+966511111111',
      email: 'aljawhra@example.com',
      priceListId: defaultPriceList.id,
      supervisorId: supervisor1.id,
      creditLimit: '50000.00',
      currentBalance: '12500.00',
      totalOrders: 45,
      totalSpent: '125000.00',
      isActive: true,
    }).returning();

    await db.insert(customerAddresses).values({
      customerId: customer1.id,
      label: 'Main Store',
      addressLine1: 'King Fahd Road',
      addressLine2: 'Building 123',
      city: 'Riyadh',
      region: 'Riyadh Province',
      postalCode: '11564',
      isDefault: true,
    });

    // Customer 2 - Basma Grocery
    const [customer2User] = await db.insert(users).values({
      email: 'basma@example.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
    }).returning();

    const [customer2] = await db.insert(customers).values({
      userId: customer2User.id,
      businessName: 'Basma Grocery',
      businessNameAr: 'بقالة بسمة',
      contactName: 'Abdullah Al-Basma',
      phone: '+966522222222',
      email: 'basma@example.com',
      priceListId: vipPriceList.id,
      supervisorId: supervisor1.id,
      creditLimit: '30000.00',
      currentBalance: '5000.00',
      totalOrders: 78,
      totalSpent: '89000.00',
      isActive: true,
    }).returning();

    await db.insert(customerAddresses).values({
      customerId: customer2.id,
      label: 'Main Branch',
      addressLine1: 'Olaya Street',
      city: 'Riyadh',
      region: 'Riyadh Province',
      postalCode: '11432',
      isDefault: true,
    });

    // Customer 3 - Al-Noor Market
    const [customer3User] = await db.insert(users).values({
      email: 'alnoor@example.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
    }).returning();

    const [customer3] = await db.insert(customers).values({
      userId: customer3User.id,
      businessName: 'Al-Noor Market',
      businessNameAr: 'سوق النور',
      contactName: 'Khalid Al-Noor',
      phone: '+966533333333',
      email: 'alnoor@example.com',
      priceListId: wholesalePriceList.id,
      supervisorId: supervisor2.id,
      creditLimit: '100000.00',
      currentBalance: '25000.00',
      totalOrders: 120,
      totalSpent: '450000.00',
      isActive: true,
    }).returning();

    await db.insert(customerAddresses).values({
      customerId: customer3.id,
      label: 'Warehouse',
      addressLine1: 'Industrial Area',
      addressLine2: 'Warehouse 45',
      city: 'Jeddah',
      region: 'Makkah Province',
      postalCode: '21442',
      isDefault: true,
    });
    console.log('✓ Customers created with addresses');

    // ============================================
    // 7.5 CREATE PAYMENT METHODS
    // ============================================
    console.log('Creating payment methods...');
    
    // Customer 1 payment methods
    await db.insert(customerPaymentMethods).values({
      customerId: customer1.id,
      type: 'credit',
      label: 'Visa Card',
      details: JSON.stringify({ lastFour: '4532', expiryDate: '12/27' }),
      isDefault: true,
    });
    await db.insert(customerPaymentMethods).values({
      customerId: customer1.id,
      type: 'bank_transfer',
      label: 'Bank Account - Al Rajhi',
      details: JSON.stringify({ bankName: 'Al Rajhi Bank' }),
      isDefault: false,
    });

    // Customer 2 payment methods
    await db.insert(customerPaymentMethods).values({
      customerId: customer2.id,
      type: 'credit',
      label: 'Mastercard',
      details: JSON.stringify({ lastFour: '8891', expiryDate: '06/26' }),
      isDefault: true,
    });

    // Customer 3 payment methods
    await db.insert(customerPaymentMethods).values({
      customerId: customer3.id,
      type: 'cash',
      label: 'Cash on Delivery',
      details: null,
      isDefault: true,
    });
    await db.insert(customerPaymentMethods).values({
      customerId: customer3.id,
      type: 'bank_transfer',
      label: 'Bank Account - NCB',
      details: JSON.stringify({ bankName: 'National Commercial Bank' }),
      isDefault: false,
    });
    console.log('✓ Payment methods created');

    // ============================================
    // 7.6 CREATE NOTIFICATIONS
    // ============================================
    console.log('Creating notifications...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Notifications for customer 1
    await db.insert(notifications).values([
      {
        userId: customer1User.id,
        title: 'مرحباً بك في سودانكو',
        message: 'شكراً لانضمامك إلينا! استمتع بالتسوق واحصل على خصومات حصرية.',
        type: 'system',
        isRead: true,
        createdAt: twoDaysAgo,
      },
      {
        userId: customer1User.id,
        title: 'خصم صيفي 15%',
        message: 'استمتع بخصم 15% على جميع المشروبات الغازية لفترة محدودة!',
        type: 'discount',
        isRead: false,
        createdAt: yesterday,
      },
      {
        userId: customer1User.id,
        title: 'طلبك في الطريق',
        message: 'تم شحن طلبك رقم #1234 وسيصل خلال 2-3 أيام عمل.',
        type: 'order',
        isRead: false,
        createdAt: new Date(),
      },
    ]);

    // Notifications for customer 2
    await db.insert(notifications).values([
      {
        userId: customer2User.id,
        title: 'مرحباً بك في سودانكو',
        message: 'شكراً لانضمامك إلينا! استمتع بالتسوق واحصل على خصومات حصرية.',
        type: 'system',
        isRead: true,
        createdAt: twoDaysAgo,
      },
      {
        userId: customer2User.id,
        title: 'عرض خاص لعملاء VIP',
        message: 'بصفتك عميل VIP، احصل على خصم إضافي 5% على طلبك القادم!',
        type: 'discount',
        isRead: false,
        createdAt: new Date(),
      },
    ]);

    // Notifications for customer 3
    await db.insert(notifications).values([
      {
        userId: customer3User.id,
        title: 'مرحباً بك في سودانكو',
        message: 'شكراً لانضمامك إلينا! استمتع بالتسوق واحصل على خصومات حصرية.',
        type: 'system',
        isRead: true,
        createdAt: twoDaysAgo,
      },
    ]);
    console.log('✓ Notifications created');

    // ============================================
    // 8. CREATE DISCOUNTS
    // ============================================
    console.log('Creating discounts...');
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Percentage discount
    const [percentDiscount] = await db.insert(discounts).values({
      name: 'Summer Sale 15% Off',
      nameAr: 'تخفيضات الصيف 15%',
      description: '15% off on all soft drinks',
      type: 'percentage',
      value: '15.00',
      startDate: now,
      endDate: nextMonth,
      isActive: true,
    }).returning();

    // Add soft drink products to this discount
    const softDrinkProducts = createdProducts.filter(p => 
      ['COLA-330', 'COLA-1L', 'LEMON-330', 'ORANGE-330'].includes(p.sku)
    );
    for (const product of softDrinkProducts) {
      await db.insert(discountProducts).values({
        discountId: percentDiscount.id,
        productId: product.id,
      });
    }

    // Fixed amount discount
    await db.insert(discounts).values({
      name: 'SAR 50 Off Orders Over 500',
      nameAr: 'خصم 50 ريال على الطلبات فوق 500',
      description: 'Get SAR 50 off when you spend SAR 500 or more',
      type: 'fixed',
      value: '50.00',
      minOrderAmount: '500.00',
      startDate: now,
      endDate: nextMonth,
      isActive: true,
    });

    // Buy X Get Y discount
    const colaProduct = createdProducts.find(p => p.sku === 'COLA-330');
    if (colaProduct) {
      await db.insert(discounts).values({
        name: 'Buy 10 Get 2 Free Cola',
        nameAr: 'اشتر 10 كولا واحصل على 2 مجاناً',
        description: 'Buy 10 cases of Cola 330ml and get 2 free',
        type: 'buy_get',
        value: '0',
        minQuantity: 10,
        bonusQuantity: 2,
        bonusProductId: colaProduct.id,
        startDate: now,
        endDate: nextMonth,
        isActive: true,
      });
    }
    console.log('✓ Discounts created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin: admin@soudanco.com / admin123');
    console.log('  Supervisor: ahmed.supervisor@soudanco.com / supervisor123');
    console.log('  Customer: aljawhra@example.com / customer123');
    console.log('  Customer: basma@example.com / customer123');
    console.log('  Customer: alnoor@example.com / customer123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }

  process.exit(0);
}

seed();
