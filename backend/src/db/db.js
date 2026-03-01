const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.Mongo_URL);
        console.log('Connect to MongoDB successfully');
    } catch (error) {
        console.log('Connect to MongoDB failed',error.message);
    }
}
module.exports = connectDB;