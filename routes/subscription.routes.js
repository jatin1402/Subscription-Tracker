import { Router } from "express";
import { createSubscription, getSubscriptions } from "../controllers/subscription.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
    res.send({title: "GET all the subscriptions"});
})
subscriptionRouter.get("/:id", (req, res) => {
    res.send({title: "GET subscription details"});
})
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.put("/:id", (req, res) => {
    res.send({title: "Update subscription details"});
});
subscriptionRouter.delete("/:id", (req, res) => {
    res.send({title: "Delete subscription"});
});

subscriptionRouter.get("/user/:id", getSubscriptions);

subscriptionRouter.get("/:id/cancel", (req, res) => {
    res.send({title: "Cancel subscription"});
});

subscriptionRouter.get("/upcoming-renewals", (req, res) => {
    res.send({title: "GET all upcoming renewals"});
});

export default subscriptionRouter;