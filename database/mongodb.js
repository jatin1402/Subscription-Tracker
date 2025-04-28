import mongoose from "mongoose";
import { PORT, NODE_ENV, DB_URI } from "../config/env.js";

if(!DB_URI) {
    throw new Error("DB_URI is not defined in .env.<developme>.local file");
}

const connectToDatabase = async () => {
    
    try {
        await mongoose.connect(DB_URI);
        console.log(`Connected to MongoDB in ${NODE_ENV} mode`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectToDatabase;