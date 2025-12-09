import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parth_agrotech';

let isConnected = false;

export async function connectDB() {
    if (isConnected) {
        return;
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//<credentials>@')); // Hide password in logs

    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            connectTimeoutMS: 30000,
        });
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('');
        console.error('💡 Troubleshooting tips:');
        console.error('   1. Check if MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for testing)');
        console.error('   2. Verify username/password are correct');
        console.error('   3. Ensure the database cluster is running');
        throw error;
    }
}

export { mongoose };
