const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.warn("Primary MongoDB Connection Failed:", error.message);
        try {
            console.log("Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/taskdb)...");
            await mongoose.connect("mongodb://127.0.0.1:27017/taskdb");
            console.log("✅ Fallback Local MongoDB Connected");
        } catch (localErr) {
            console.warn("MongoDB Connection Failed - server running without database connection:", localErr.message);
        }
    }
};

module.exports = connectDB;