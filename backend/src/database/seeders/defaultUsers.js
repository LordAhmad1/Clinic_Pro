const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const logger = require('../../utils/logger');

/**
 * Default manager user that will be created when the project is first installed
 * This is the main admin user that will be available for login when someone buys your system
 * The manager can then create doctors and secretaries from the admin panel
 */
const defaultUsers = [
  {
    firstName: 'Clinic',
    lastName: 'Manager',
    email: 'admin@clinic.com',
    phone: '+1234567890',
    password: 'admin123',
    role: 'manager',
    dateOfBirth: '1980-01-01',
    gender: 'male',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    isVerified: true,
    isActive: true,
    preferences: {
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  }
];

/**
 * Seed default users into the database
 * This function will be called when the project is first installed
 */
async function seedDefaultUsers() {
  try {
    logger.info('Starting to seed default users...');

    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        logger.info(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create new user
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      logger.info(`✅ Created default user: ${userData.email} (${userData.role})`);
    }

    logger.info('✅ Default users seeding completed successfully!');
    
    // Log the credentials for easy access
    console.log('\n📋 DEFAULT USER CREDENTIALS:');
    console.log('=====================================');
    defaultUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log('   ---');
    });
    console.log('=====================================\n');

  } catch (error) {
    logger.error('❌ Error seeding default users:', error);
    throw error;
  }
}

/**
 * Remove all default users (for testing/reset purposes)
 */
async function removeDefaultUsers() {
  try {
    const emails = defaultUsers.map(user => user.email);
    const result = await User.deleteMany({ email: { $in: emails } });
    logger.info(`Removed ${result.deletedCount} default users`);
  } catch (error) {
    logger.error('Error removing default users:', error);
    throw error;
  }
}

module.exports = {
  seedDefaultUsers,
  removeDefaultUsers,
  defaultUsers
};
