import mongoose from "mongoose";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/workflow.js";
import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const reqBody = { ...req.body, user: req.user._id };
        
        // Check if subscription already exists
        const subscriptionExists = await Subscription.findOne({ 
            name: reqBody.name, 
            user: req.user._id 
        }).session(session);
        
        if (subscriptionExists) {
            const error = new Error("You already have an active subscription");
            error.statusCode = 409;
            throw error;
        }

        // Create subscription using the session
        const subscription = await Subscription.create([reqBody], { session });

        // Publish workflow
        try {
            const { messageId } = await workflowClient.publishJSON({
                url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                body: {
                    subscriptionId: subscription[0]._id,
                },
                headers: {
                    'content-type': 'application/json',
                },
            });

            await session.commitTransaction();
            
            res.status(200).json({
                success: true,
                message: "Subscription created successfully",
                data: { 
                    subscription: subscription[0], 
                    workflowId: messageId 
                },
            });
        } catch (workflowError) {
            // If workflow fails, rollback the transaction
            await session.abortTransaction();
            throw new Error("Failed to schedule reminders");
        }
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

export const getSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ user: req.params.id })
            .populate("user", "-password")
            .sort("-createdAt");
            
        res.status(200).json({
            success: true,  
            message: "Subscriptions fetched successfully",
            data: subscriptions,
        });
    } catch (err) {
        next(err);
    }
}