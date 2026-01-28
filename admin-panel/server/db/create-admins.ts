import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcrypt';

/**
 * Script to create 3 admin accounts
 * Run with: pnpm tsx server/db/create-admins.ts
 */
async function createAdmins() {
  console.log('🔐 Creating admin accounts...\n');

  const adminAccounts = [
    {
      email: 'admin1@soudanco.com',
      username: 'admin1',
      password: 'admin1@2026',
    },
    {
      email: 'admin2@soudanco.com',
      username: 'admin2',
      password: 'admin2@2026',
    },
    {
      email: 'admin3@soudanco.com',
      username: 'admin3',
      password: 'admin3@2026',
    },
  ];

  try {
    for (const admin of adminAccounts) {
      // Hash the password
      const passwordHash = await bcrypt.hash(admin.password, 10);

      // Insert the admin user
      const [newAdmin] = await db.insert(users).values({
        email: admin.email,
        passwordHash: passwordHash,
        role: 'admin',
        isActive: true,
      }).returning();

      console.log(`✅ Admin created:`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   ID: ${newAdmin.id}\n`);
    }

    console.log('🎉 All admin accounts created successfully!\n');
    console.log('📋 Summary:');
    console.log('   admin1@soudanco.com / admin1@2026');
    console.log('   admin2@soudanco.com / admin2@2026');
    console.log('   admin3@soudanco.com / admin3@2026');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin accounts:', error);
    process.exit(1);
  }
}

createAdmins();
