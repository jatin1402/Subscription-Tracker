import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const signUp = async(req, res, next) => {
    // we are going to use mongoose to create a new user
    
    // we create a new session to handle transactions
    // this will help us to rollback the changes if something goes wrong
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // we create a new user
        const {name, email, password} = req.body;

        // Check if user exists using the session
        const existingUser = await User.findOne({ email }).session(session);
        if(existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        // we can use bcrypt to hash the password
        // salt is a random string that is used to hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{
            name,
            email,
            password: hashedPassword,
        }], { session });

        // genertae a jwt token so that the user can use it to authenticate or sign in

        const token = jwt.sign({ id: newUsers[0]._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUsers[0],
            },
        });
    } catch(err) {
        // if at any point something went wrong, abort the transaction;
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("Invalid Email");
            error.statusCode = 401;
            throw error;
        }
        // we can use bcrypt to compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid Password");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                user,
            },
        });

    }
    catch(err) {
        next(err);
    }   
}

export const signOut = (req, res) => {}