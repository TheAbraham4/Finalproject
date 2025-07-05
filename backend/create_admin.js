require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (same as in your userMongo.js)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'customer'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    await connectDB();
    
    // Admin user details
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@theabraham.com',
      password: 'Admin123!', 
      role: 'admin'
    };
    
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('Existing admin details:');
      console.log('- Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('- Email:', existingAdmin.email);
      console.log('- Role:', existingAdmin.role);
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Create admin user
    const adminUser = new User({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n🔐 IMPORTANT: Please change the password after first login!');
    console.log('\n🌐 Access the admin dashboard at: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser();
