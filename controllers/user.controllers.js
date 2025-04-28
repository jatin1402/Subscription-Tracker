import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const getUsers = async(req, res, next) => {
    try {
        let users = await User.find();
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    }catch(err) {
        next(err)
    }
};

export const getUser = async(req, res, next) => {
    try{ 
        let user = await User.findById(req.params.id).select("-password");

        if(!user){
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    }catch(err) {
        next(err);
    }
}

export const updateUser = async(req, res, next) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;
        }
        let user =  await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select("-password");
        console.log(user)
        if(!user){
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch(err) {
        next(err);
    }
}