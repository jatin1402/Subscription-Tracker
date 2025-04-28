import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [50, "Name must be at most 50 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    },
    phone: {
        type: String,
        match: [/^\+[1-9]\d{1,14}$/, "Please enter a valid phone number in E.164 format"],
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;