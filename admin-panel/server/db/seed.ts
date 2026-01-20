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

// Base URL for product images - change this based on your deployment
const IMAGE_BASE_URL = '/assets/products';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // ============================================
    // 0. CLEAN UP EXISTING DATA
    // ============================================
    console.log('🧹 Cleaning up existing data...');
    
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
    
    console.log('✅ Existing data cleaned');

    // ============================================
    // 1. CREATE ADMIN USER
    // ============================================
    console.log('👤 Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
      email: 'admin@soudanco.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
    }).returning();
    console.log('✅ Admin user created: admin@soudanco.com / admin123');

    // ============================================
    // 2. CREATE CATEGORIES
    // ============================================
    console.log('📁 Creating categories...');
    
    const [juices1LCategory] = await db.insert(categories).values({
      name: 'Juices 1L',
      nameAr: 'عصائر 1 لتر',
      slug: 'juices-1l',
      description: 'Suntop 1 Liter juice bottles',
      imageUrl: `${IMAGE_BASE_URL}/orange-1l.png`,
      sortOrder: 1,
      isActive: true,
    }).returning();

    const [juices250mlCategory] = await db.insert(categories).values({
      name: 'Juices 250ml',
      nameAr: 'عصائر 250 مل',
      slug: 'juices-250ml',
      description: 'Suntop 250ml juice bottles',
      imageUrl: `${IMAGE_BASE_URL}/orange-250ml.png`,
      sortOrder: 2,
      isActive: true,
    }).returning();

    console.log('✅ Categories created: Juices 1L, Juices 250ml');

    // ============================================
    // 3. CREATE SUNTOP PRODUCTS (ACTUAL PRODUCTS)
    // ============================================
    console.log('🥤 Creating Suntop products...');

    const productList = await db.insert(products).values([
      // ============================================
      // 1 LITER PRODUCTS
      // ============================================
      {
        sku: 'ST-ORANGE-1L',
        name: 'Suntop Orange',
        nameAr: 'صن توب برتقال',
        description: 'Premium Suntop orange juice, 1 Liter',
        descriptionAr: 'عصير صن توب برتقال فاخر، 1 لتر',
        categoryId: juices1LCategory.id,
        basePrice: '18.00',
        unit: '1 لتر',
        unitsPerCase: 12,
        stockQuantity: 500,
        lowStockThreshold: 50,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/orange-1l.png`,
        isActive: true,
      },
      {
        sku: 'ST-APPLE-1L',
        name: 'Suntop Apple',
        nameAr: 'صن توب تفاح',
        description: 'Fresh Suntop apple juice, 1 Liter',
        descriptionAr: 'عصير صن توب تفاح طازج، 1 لتر',
        categoryId: juices1LCategory.id,
        basePrice: '17.00',
        unit: '1 لتر',
        unitsPerCase: 12,
        stockQuantity: 420,
        lowStockThreshold: 50,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/apple-1l.png`,
        isActive: true,
      },
      {
        sku: 'ST-BERRYMIX-1L',
        name: 'Suntop Berry Mix',
        nameAr: 'صن توب خليط التوت',
        description: 'Delicious Suntop berry mix juice, 1 Liter',
        descriptionAr: 'عصير صن توب خليط التوت اللذيذ، 1 لتر',
        categoryId: juices1LCategory.id,
        basePrice: '19.00',
        unit: '1 لتر',
        unitsPerCase: 12,
        stockQuantity: 350,
        lowStockThreshold: 50,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/berry-mix-1l.png`,
        isActive: true,
      },
      {
        sku: 'ST-BLACKCURRANT-1L',
        name: 'Suntop Blackcurrant',
        nameAr: 'صن توب توت أسود',
        description: 'Rich Suntop blackcurrant juice, 1 Liter',
        descriptionAr: 'عصير صن توب توت أسود غني، 1 لتر',
        categoryId: juices1LCategory.id,
        basePrice: '19.50',
        unit: '1 لتر',
        unitsPerCase: 12,
        stockQuantity: 280,
        lowStockThreshold: 50,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/blackcurrent-1l.png`,
        isActive: true,
      },
      {
        sku: 'ST-PINEAPPLE-1L',
        name: 'Suntop Pineapple',
        nameAr: 'صن توب أناناس',
        description: 'Tropical Suntop pineapple juice, 1 Liter',
        descriptionAr: 'عصير صن توب أناناس استوائي، 1 لتر',
        categoryId: juices1LCategory.id,
        basePrice: '18.50',
        unit: '1 لتر',
        unitsPerCase: 12,
        stockQuantity: 220,
        lowStockThreshold: 50,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/pineapple-1l.png`,
        isActive: true,
      },
      // ============================================
      // 250ml PRODUCTS
      // ============================================
      {
        sku: 'ST-ORANGE-250',
        name: 'Suntop Orange',
        nameAr: 'صن توب برتقال',
        description: 'Premium Suntop orange juice, 250ml',
        descriptionAr: 'عصير صن توب برتقال فاخر، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.00',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 800,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/orange-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-APPLE-250',
        name: 'Suntop Apple',
        nameAr: 'صن توب تفاح',
        description: 'Fresh Suntop apple juice, 250ml',
        descriptionAr: 'عصير صن توب تفاح طازج، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '5.50',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 720,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/apple-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-BERRYMIX-250',
        name: 'Suntop Berry Mix',
        nameAr: 'صن توب خليط التوت',
        description: 'Delicious Suntop berry mix juice, 250ml',
        descriptionAr: 'عصير صن توب خليط التوت اللذيذ، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.50',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 650,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/berry-mix-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-BLACKCURRANT-250',
        name: 'Suntop Blackcurrant',
        nameAr: 'صن توب توت أسود',
        description: 'Rich Suntop blackcurrant juice, 250ml',
        descriptionAr: 'عصير صن توب توت أسود غني، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.50',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 40,
        lowStockThreshold: 100,
        stockStatus: 'low_stock',
        imageUrl: `${IMAGE_BASE_URL}/black-current-250-ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-MANGO-250',
        name: 'Suntop Mango',
        nameAr: 'صن توب مانجو',
        description: 'Tropical Suntop mango juice, 250ml',
        descriptionAr: 'عصير صن توب مانجو استوائي، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.50',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 580,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/mango-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-GUAVA-250',
        name: 'Suntop Guava',
        nameAr: 'صن توب جوافة',
        description: 'Fresh Suntop guava juice, 250ml',
        descriptionAr: 'عصير صن توب جوافة طازج، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.00',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 520,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/guava-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-MIXEDFRUIT-250',
        name: 'Suntop Mixed Fruit',
        nameAr: 'صن توب كوكتيل فواكه',
        description: 'Delicious Suntop mixed fruit juice, 250ml',
        descriptionAr: 'عصير صن توب كوكتيل فواكه اللذيذ، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.00',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 480,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/mixed-fruit-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-PINEAPPLE-250',
        name: 'Suntop Pineapple',
        nameAr: 'صن توب أناناس',
        description: 'Tropical Suntop pineapple juice, 250ml',
        descriptionAr: 'عصير صن توب أناناس استوائي، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.00',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 0,
        lowStockThreshold: 100,
        stockStatus: 'out_of_stock',
        imageUrl: `${IMAGE_BASE_URL}/pinapple-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-PINKLEMONADE-250',
        name: 'Suntop Pink Lemonade',
        nameAr: 'صن توب ليمون وردي',
        description: 'Refreshing Suntop pink lemonade, 250ml',
        descriptionAr: 'صن توب ليمون وردي منعش، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '6.50',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 380,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/pink-lemonade-250ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-DRAGONFRUIT-250',
        name: 'Suntop Frosty Dragon Fruit',
        nameAr: 'صن توب فروستي دراجون فروت',
        description: 'Exotic Suntop frosty dragon fruit juice, 250ml',
        descriptionAr: 'عصير صن توب فروستي دراجون فروت الغريب، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '7.00',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 420,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/frosty-drangon-fruit-250-ml.png`,
        isActive: true,
      },
      {
        sku: 'ST-SPICYTANGERINE-250',
        name: 'Suntop Spicy Tangerine',
        nameAr: 'صن توب يوسفي حار',
        description: 'Unique Suntop spicy tangerine juice, 250ml',
        descriptionAr: 'عصير صن توب يوسفي حار مميز، 250 مل',
        categoryId: juices250mlCategory.id,
        basePrice: '7.00',
        unit: '250 مل',
        unitsPerCase: 24,
        stockQuantity: 350,
        lowStockThreshold: 100,
        stockStatus: 'in_stock',
        imageUrl: `${IMAGE_BASE_URL}/spicy-tangarine-305ml.png`,
        isActive: true,
      },
    ]).returning();

    console.log(`✅ Created ${productList.length} Suntop products`);

    // ============================================
    // 4. CREATE PRICE LISTS
    // ============================================
    console.log('💰 Creating price lists...');

    const [goldPriceList] = await db.insert(priceLists).values({
      name: 'Gold',
      nameAr: 'ذهبي',
      description: 'Premium pricing for top customers - 15% discount',
      isDefault: false,
      isActive: true,
    }).returning();

    const [silverPriceList] = await db.insert(priceLists).values({
      name: 'Silver',
      nameAr: 'فضي',
      description: 'Standard pricing for regular customers - 10% discount',
      isDefault: true,
      isActive: true,
    }).returning();

    const [bronzePriceList] = await db.insert(priceLists).values({
      name: 'Bronze',
      nameAr: 'برونزي',
      description: 'Entry level pricing for new customers - 5% discount',
      isDefault: false,
      isActive: true,
    }).returning();

    console.log('✅ Price lists created: Gold (15% off), Silver (10% off), Bronze (5% off)');

    // ============================================
    // 5. CREATE PRICE LIST ITEMS
    // ============================================
    console.log('📋 Creating price list items...');

    for (const product of productList) {
      const basePrice = parseFloat(product.basePrice);
      
      // Gold: 15% discount
      await db.insert(priceListItems).values({
        priceListId: goldPriceList.id,
        productId: product.id,
        price: (basePrice * 0.85).toFixed(2),
      });

      // Silver: 10% discount
      await db.insert(priceListItems).values({
        priceListId: silverPriceList.id,
        productId: product.id,
        price: (basePrice * 0.90).toFixed(2),
      });

      // Bronze: 5% discount
      await db.insert(priceListItems).values({
        priceListId: bronzePriceList.id,
        productId: product.id,
        price: (basePrice * 0.95).toFixed(2),
      });
    }

    console.log('✅ Price list items created for all products');

    // ============================================
    // 6. CREATE TEST CUSTOMER USER
    // ============================================
    console.log('👤 Creating test customer user...');
    const customerPasswordHash = await bcrypt.hash('1223456', 10);
    const [customerUser] = await db.insert(users).values({
      email: 'w@w.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      isActive: true,
    }).returning();

    const [customer] = await db.insert(customers).values({
      userId: customerUser.id,
      businessName: 'Waseem Market',
      businessNameAr: 'سوق وسيم',
      contactName: 'Waseem',
      phone: '+966501234567',
      email: 'w@w.com',
      priceListId: goldPriceList.id,
      creditLimit: '50000.00',
      currentBalance: '0.00',
      walletBalance: '1000.00',
      totalOrders: 0,
      totalSpent: '0.00',
      isActive: true,
    }).returning();

    // Add address for customer
    const [customerAddress] = await db.insert(customerAddresses).values({
      customerId: customer.id,
      label: 'المتجر الرئيسي',
      addressLine1: 'شارع الملك فهد',
      addressLine2: 'مبنى 5، الطابق الأول',
      city: 'الرياض',
      region: 'منطقة الرياض',
      postalCode: '12345',
      country: 'المملكة العربية السعودية',
      isDefault: true,
    }).returning();

    console.log('✅ Test customer created: w@w.com / 1223456');

    // ============================================
    // 7. CREATE SAMPLE DISCOUNTS
    // ============================================
    console.log('🎁 Creating sample discounts...');

    // Buy 5 get 1 free on Orange Juice 1L
    const orange1L = productList.find(p => p.sku === 'ST-ORANGE-1L');
    if (orange1L) {
      const [buyGetDiscount] = await db.insert(discounts).values({
        name: 'Buy 5 Get 1 Free - Orange 1L',
        nameAr: 'اشتري 5 واحصل على 1 مجاناً - برتقال 1 لتر',
        description: 'Buy 5 cartons of Orange Juice 1L and get 1 free',
        type: 'buy_get',
        value: '1',
        minQuantity: 5,
        bonusQuantity: 1,
        bonusProductId: orange1L.id,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
      }).returning();

      await db.insert(discountProducts).values({
        discountId: buyGetDiscount.id,
        productId: orange1L.id,
      });
    }

    // Buy 3 Apple get 1 Berry Mix free
    const apple250 = productList.find(p => p.sku === 'ST-APPLE-250');
    const berryMix250 = productList.find(p => p.sku === 'ST-BERRYMIX-250');
    if (apple250 && berryMix250) {
      const [buyGetDiscount2] = await db.insert(discounts).values({
        name: 'Buy 3 Apple Get 1 Berry Mix Free',
        nameAr: 'اشتري 3 تفاح واحصل على 1 خليط توت مجاناً',
        description: 'Buy 3 Apple 250ml and get 1 Berry Mix 250ml free',
        type: 'buy_get',
        value: '1',
        minQuantity: 3,
        bonusQuantity: 1,
        bonusProductId: berryMix250.id,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
      }).returning();

      await db.insert(discountProducts).values({
        discountId: buyGetDiscount2.id,
        productId: apple250.id,
      });
    }

    // Spend 500 get 10% off
    await db.insert(discounts).values({
      name: 'Spend 500 SAR Get 10% Off',
      nameAr: 'أنفق 500 ريال واحصل على خصم 10%',
      description: 'Get 10% discount when spending 500 SAR or more',
      type: 'spend_bonus',
      value: '10',
      minOrderAmount: '500.00',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    });

    // Spend 1000 get 15% off
    await db.insert(discounts).values({
      name: 'Spend 1000 SAR Get 15% Off',
      nameAr: 'أنفق 1000 ريال واحصل على خصم 15%',
      description: 'Get 15% discount when spending 1000 SAR or more',
      type: 'spend_bonus',
      value: '15',
      minOrderAmount: '1000.00',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    });

    console.log('✅ Sample discounts created (2 buy_get, 2 spend_bonus)');

    // ============================================
    // 8. CREATE SAMPLE ORDERS
    // ============================================
    console.log('📦 Creating sample orders...');

    const [order1] = await db.insert(orders).values({
      orderNumber: 'ORD-2026-0001',
      customerId: customer.id,
      addressId: customerAddress.id,
      status: 'delivered',
      subtotal: '540.00',
      discountAmount: '54.00',
      taxAmount: '0.00',
      total: '486.00',
      paymentMethod: 'credit',
      paidAmount: '486.00',
      notes: 'First order - delivered successfully',
    }).returning();

    // Order items for order 1
    await db.insert(orderItems).values([
      {
        orderId: order1.id,
        productId: productList[0].id, // Orange 1L
        productName: 'صن توب برتقال 1 لتر',
        quantity: 10,
        unitPrice: '15.30',
        totalPrice: '153.00',
      },
      {
        orderId: order1.id,
        productId: productList[1].id, // Apple 1L
        productName: 'صن توب تفاح 1 لتر',
        quantity: 10,
        unitPrice: '14.45',
        totalPrice: '144.50',
      },
      {
        orderId: order1.id,
        productId: productList[5].id, // Orange 250ml
        productName: 'صن توب برتقال 250 مل',
        quantity: 20,
        unitPrice: '5.10',
        totalPrice: '102.00',
      },
    ]);

    const [order2] = await db.insert(orders).values({
      orderNumber: 'ORD-2026-0002',
      customerId: customer.id,
      addressId: customerAddress.id,
      status: 'processing',
      subtotal: '380.00',
      discountAmount: '0.00',
      taxAmount: '0.00',
      total: '380.00',
      paymentMethod: 'cash',
      paidAmount: '0.00',
      notes: 'Pending payment',
    }).returning();

    // Order items for order 2
    await db.insert(orderItems).values([
      {
        orderId: order2.id,
        productId: productList[9].id, // Mango 250ml
        productName: 'صن توب مانجو 250 مل',
        quantity: 30,
        unitPrice: '5.53',
        totalPrice: '165.90',
      },
      {
        orderId: order2.id,
        productId: productList[10].id, // Guava 250ml
        productName: 'صن توب جوافة 250 مل',
        quantity: 30,
        unitPrice: '5.10',
        totalPrice: '153.00',
      },
    ]);

    console.log('✅ Sample orders created (1 delivered, 1 processing)');

    // ============================================
    // 9. CREATE SAMPLE PAYMENT
    // ============================================
    console.log('💳 Creating sample payment...');

    await db.insert(payments).values({
      paymentNumber: 'PAY-2026-0001',
      customerId: customer.id,
      orderId: order1.id,
      amount: '486.00',
      method: 'bank_transfer',
      status: 'completed',
      reference: 'BANK-REF-123456',
      notes: 'Payment for order ORD-2026-0001',
      processedAt: new Date(),
    });

    console.log('✅ Sample payment created');

    // ============================================
    // 10. CREATE SAMPLE NOTIFICATIONS
    // ============================================
    console.log('🔔 Creating sample notifications...');

    await db.insert(notifications).values([
      {
        userId: customerUser.id,
        type: 'order',
        title: 'Order Delivered',
        titleAr: 'تم توصيل الطلب',
        message: 'Your order ORD-2026-0001 has been delivered successfully',
        messageAr: 'تم توصيل طلبك ORD-2026-0001 بنجاح',
        referenceId: order1.id,
        isRead: true,
      },
      {
        userId: customerUser.id,
        type: 'order',
        title: 'Order Processing',
        titleAr: 'جاري معالجة الطلب',
        message: 'Your order ORD-2026-0002 is being processed',
        messageAr: 'جاري معالجة طلبك ORD-2026-0002',
        referenceId: order2.id,
        isRead: false,
      },
      {
        userId: customerUser.id,
        type: 'discount',
        title: 'New Offer Available!',
        titleAr: 'عرض جديد متاح!',
        message: 'Buy 5 cartons of Orange Juice 1L and get 1 free!',
        messageAr: 'اشتري 5 كراتين عصير برتقال 1 لتر واحصل على 1 مجاناً!',
        isRead: false,
      },
    ]);

    console.log('✅ Sample notifications created');

    // ============================================
    // DONE
    // ============================================
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   👤 Admin: admin@soudanco.com / admin123');
    console.log('   👤 Customer: w@w.com / 1223456');
    console.log(`   📁 Categories: 2 (Juices 1L, Juices 250ml)`);
    console.log(`   🥤 Products: ${productList.length} Suntop products with real images`);
    console.log('   💰 Price Lists: Gold (15% off), Silver (10% off), Bronze (5% off)');
    console.log('   🎁 Discounts: 4 (2 buy_get, 2 spend_bonus)');
    console.log('   📦 Orders: 2');
    console.log('   💳 Payments: 1');
    console.log('   🔔 Notifications: 3');
    console.log('\n   📸 Product images location: /assets/products/');
    console.log('\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
