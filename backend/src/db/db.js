require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connect to MongoDB successfully');
    } catch (error) {
        console.log('Connect to MongoDB failed',error.message);
    }
}
module.exports = connectDB;