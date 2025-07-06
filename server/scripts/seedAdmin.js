import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './.env' });

// Default admin configuration
const DEFAULT_ADMIN = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@healthcare.com',
  password: 'Admin123!',
  role: 'admin',
  phone: '+1-555-0123',
  address: {
    street: '123 Healthcare Ave',
    city: 'Medical City',
    state: 'MC',
    zipCode: '12345',
    country: 'United States'
  },
  isActive: true,
  isEmailVerified: true
};

// Additional admin users
const ADDITIONAL_ADMINS = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@healthcare.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+1-555-0124',
    address: {
      street: '456 Medical Blvd',
      city: 'Health Town',
      state: 'HT',
      zipCode: '67890',
      country: 'United States'
    },
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@healthcare.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+1-555-0125',
    address: {
      street: '789 Clinic Drive',
      city: 'Care City',
      state: 'CC',
      zipCode: '11111',
      country: 'United States'
    },
    isActive: true,
    isEmailVerified: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Check if admin already exists
const checkAdminExists = async (email) => {
  try {
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    return existingAdmin;
  } catch (error) {
    console.error('Error checking admin existence:', error.message);
    return null;
  }
};

// Create admin user
const createAdmin = async (adminData) => {
  try {
    // Check if admin already exists
    const existingAdmin = await checkAdminExists(adminData.email);
    if (existingAdmin) {
      console.log(`⚠️  Admin with email ${adminData.email} already exists`);
      return existingAdmin;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();
    
    console.log(`✅ Admin created successfully: ${admin.fullName} (${admin.email})`);
    return admin;
  } catch (error) {
    console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
    return null;
  }
};

// Create all admins
const seedAdmins = async () => {
  try {
    console.log('🚀 Starting admin seeding process...\n');
    
    // Create default admin
    console.log('📝 Creating default admin...');
    const defaultAdmin = await createAdmin(DEFAULT_ADMIN);
    
    // Create additional admins
    console.log('\n📝 Creating additional admins...');
    const additionalAdmins = [];
    for (const adminData of ADDITIONAL_ADMINS) {
      const admin = await createAdmin(adminData);
      if (admin) {
        additionalAdmins.push(admin);
      }
    }
    
    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`Total admins processed: ${1 + ADDITIONAL_ADMINS.length}`);
    console.log(`Default admin: ${defaultAdmin ? '✅ Created/Exists' : '❌ Failed'}`);
    console.log(`Additional admins: ${additionalAdmins.length}/${ADDITIONAL_ADMINS.length} created`);
    
    if (defaultAdmin) {
      console.log('\n🔑 Default Admin Credentials:');
      console.log(`Email: ${DEFAULT_ADMIN.email}`);
      console.log(`Password: ${DEFAULT_ADMIN.password}`);
      console.log('⚠️  Please change the default password after first login!');
    }
    
    console.log('\n✅ Admin seeding completed!');
    
  } catch (error) {
    console.error('❌ Error during admin seeding:', error.message);
  }
};

// Create custom admin
const createCustomAdmin = async (adminData) => {
  try {
    console.log('🚀 Creating custom admin...');
    
    // Validate required fields
    if (!adminData.email || !adminData.password || !adminData.firstName || !adminData.lastName) {
      console.error('❌ Missing required fields: email, password, firstName, lastName');
      return null;
    }
    
    // Set role to admin
    adminData.role = 'admin';
    adminData.isActive = true;
    adminData.isEmailVerified = true;
    
    const admin = await createAdmin(adminData);
    if (admin) {
      console.log('✅ Custom admin created successfully!');
    }
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating custom admin:', error.message);
    return null;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--custom')) {
      // Create custom admin with environment variables
      const customAdminData = {
        firstName: process.env.ADMIN_FIRST_NAME || 'Custom',
        lastName: process.env.ADMIN_LAST_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phone: process.env.ADMIN_PHONE || '',
        address: {
          street: process.env.ADMIN_STREET || '',
          city: process.env.ADMIN_CITY || '',
          state: process.env.ADMIN_STATE || '',
          zipCode: process.env.ADMIN_ZIPCODE || '',
          country: process.env.ADMIN_COUNTRY || 'United States'
        }
      };
      
      if (!customAdminData.email || !customAdminData.password) {
        console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required for custom admin creation');
        process.exit(1);
      }
      
      await createCustomAdmin(customAdminData);
    } else {
      // Create default admins
      await seedAdmins();
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Run the script
main(); 