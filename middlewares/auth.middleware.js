import { JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authorize = async (req, res, next) => {
    try{
        let token
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if(!token){
            const error = new Error("Token not found");
            error.statusCode = 401;
            throw error;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user  = await User.findById(decoded.id);

        if(!user) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }
        // we are going to attach the user to the request object
        // so that we can use it in the next middleware or controller
        // this is a good practice to avoid querying the database again
        req.user = user;
        next();

    }catch(err) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: err.message,
        })
    }
}

export default authorize;