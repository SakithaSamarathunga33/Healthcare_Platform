# Admin Seed Guide

This guide explains how to use the admin seed file to create admin users for the healthcare platform.

## Overview

The `seedAdmin.js` file provides functionality to create admin users in the system. It supports both default admin creation and custom admin creation with environment variables.

## Features

- ✅ Create default admin users with predefined data
- ✅ Create custom admin users with environment variables
- ✅ Duplicate email checking to prevent conflicts
- ✅ Comprehensive error handling and logging
- ✅ Password hashing and security
- ✅ Database connection management

## Default Admin Users

The script creates the following default admin users:

### Primary Admin
- **Email**: admin@healthcare.com
- **Password**: Admin123!
- **Name**: Admin User
- **Phone**: +1-555-0123

### Additional Admins
1. **Sarah Johnson** (sarah.johnson@healthcare.com)
2. **Michael Chen** (michael.chen@healthcare.com)

## Usage

### 1. Create Default Admins

Run the script to create all default admin users:

```bash
cd server
npm run seed:admin
```

Or run directly:

```bash
cd server
node scripts/seedAdmin.js
```

### 2. Create Custom Admin

To create a custom admin user, set environment variables and use the `--custom` flag:

```bash
# Set environment variables
export ADMIN_EMAIL="your-admin@example.com"
export ADMIN_PASSWORD="YourSecurePassword123!"
export ADMIN_FIRST_NAME="John"
export ADMIN_LAST_NAME="Doe"
export ADMIN_PHONE="+1-555-0126"
export ADMIN_STREET="123 Custom Street"
export ADMIN_CITY="Custom City"
export ADMIN_STATE="CS"
export ADMIN_ZIPCODE="54321"
export ADMIN_COUNTRY="United States"

# Run the script
cd server
node scripts/seedAdmin.js --custom
```

### 3. Using .env File

Create or update your `.env` file in the server directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/healthcare_platform

# Custom Admin (optional)
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Doe
ADMIN_PHONE=+1-555-0126
ADMIN_STREET=123 Custom Street
ADMIN_CITY=Custom City
ADMIN_STATE=CS
ADMIN_ZIPCODE=54321
ADMIN_COUNTRY=United States
```

Then run:

```bash
cd server
node scripts/seedAdmin.js --custom
```

## Environment Variables

### Required for Custom Admin
- `ADMIN_EMAIL` - Admin email address
- `ADMIN_PASSWORD` - Admin password (min 6 characters)

### Optional for Custom Admin
- `ADMIN_FIRST_NAME` - First name (default: "Custom")
- `ADMIN_LAST_NAME` - Last name (default: "Admin")
- `ADMIN_PHONE` - Phone number
- `ADMIN_STREET` - Street address
- `ADMIN_CITY` - City
- `ADMIN_STATE` - State/Province
- `ADMIN_ZIPCODE` - ZIP/Postal code
- `ADMIN_COUNTRY` - Country (default: "United States")

### Required for Database Connection
- `MONGO_URI` - MongoDB connection string

## Output Examples

### Successful Default Admin Creation
```
🚀 Starting admin seeding process...

📝 Creating default admin...
✅ Admin created successfully: Admin User (admin@healthcare.com)

📝 Creating additional admins...
✅ Admin created successfully: Sarah Johnson (sarah.johnson@healthcare.com)
✅ Admin created successfully: Michael Chen (michael.chen@healthcare.com)

📊 Seeding Summary:
Total admins processed: 3
Default admin: ✅ Created/Exists
Additional admins: 2/2 created

🔑 Default Admin Credentials:
Email: admin@healthcare.com
Password: Admin123!
⚠️  Please change the default password after first login!

✅ Admin seeding completed!
🔌 Database connection closed
```

### Duplicate Admin Detection
```
📝 Creating default admin...
⚠️  Admin with email admin@healthcare.com already exists
```

### Custom Admin Creation
```
🚀 Creating custom admin...
✅ Admin created successfully: John Doe (your-admin@example.com)
✅ Custom admin created successfully!
🔌 Database connection closed
```

## Security Considerations

1. **Change Default Passwords**: Always change the default admin password after first login
2. **Strong Passwords**: Use strong passwords for custom admin accounts
3. **Environment Variables**: Store sensitive information in environment variables, not in code
4. **Database Security**: Ensure your MongoDB instance is properly secured
5. **Network Security**: Use HTTPS in production and secure your API endpoints

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   ❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution**: Ensure MongoDB is running and MONGO_URI is correct

2. **Missing Environment Variables**
   ```
   ❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required
   ```
   **Solution**: Set the required environment variables before running with --custom

3. **Duplicate Email Error**
   ```
   ⚠️  Admin with email admin@healthcare.com already exists
   ```
   **Solution**: This is not an error - the script prevents duplicate admins

4. **Validation Error**
   ```
   ❌ Error creating admin: Validation failed
   ```
   **Solution**: Check that all required fields are provided and valid

### Database Connection Issues

If you're having trouble connecting to MongoDB:

1. Check if MongoDB is running:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

2. Verify your connection string:
   ```env
   MONGO_URI=mongodb://localhost:27017/healthcare_platform
   ```

3. Test connection manually:
   ```bash
   mongosh "mongodb://localhost:27017/healthcare_platform"
   ```

## Integration with Existing Scripts

The admin seed script integrates with the existing npm scripts:

```json
{
  "scripts": {
    "seed:admin": "node scripts/seedAdmin.js",
    "seed:data": "node scripts/seedSampleData.js"
  }
}
```

You can run both scripts to set up a complete system:

```bash
cd server
npm run seed:admin    # Create admin users
npm run seed:data     # Create sample data (patients, doctors, appointments)
```

## Best Practices

1. **Run Once**: Only run the seed script once per environment
2. **Backup**: Backup your database before running seed scripts
3. **Test Environment**: Test the script in a development environment first
4. **Documentation**: Document any custom admin accounts created
5. **Access Control**: Limit access to the seed script in production

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check the database connection string format
5. Review the User model validation rules

For additional help, refer to the main README.md file or check the server logs for more detailed error information. 