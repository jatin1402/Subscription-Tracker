import {createRequire} from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

import Subscription from "../models/subscription.model.js";
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import { generateReminderEmailTemplate } from "../templates/email/subscription-reminder.js";
import {
    SMTP_HOST,
    SMTP_PORT,
    EMAIL_USER,
    EMAIL_PASS,
} from "../config/env.js";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

export const sendReminders = serve(async (context) => {
    console.log("hitting")
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    // logic when to exit the workflow
    if (!subscription || subscription.status !== "active") {
        console.log("subscription expired")
        return;
    }
    const renewalDate = dayjs(subscription.renewalDate);
    if (renewalDate.isBefore(dayjs())) {
        return;
    }
    // logic to enter the workflow
    const daysBeforeArray = [7, 5, 3, 1];
    for (const daysBefore of daysBeforeArray) {
        const reminderDate = renewalDate.subtract(daysBefore, "day");
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, daysBefore, reminderDate);
        }
        await triggerReminder(context, subscriptionId);
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run( "initial step", async () => {
        const subscription = await Subscription.findById(subscriptionId).populate("user", "name email");
        return subscription;
    });
};

const sleepUntilReminder = async (context, daysBefore, reminderDate) => {
    console.log(`Sleeping until next reminder ${reminderDate}, which is ${daysBefore} days before renewal date`)
    await context.sleepUntil("sleeping trigger", reminderDate.toDate());
}

const triggerReminder = async (context, subscriptionId) => {
    return await context.run("triggering step", async () => {
        console.log(`Triggering reminder for subscription ${subscriptionId}`);
        
        const subscription = await Subscription.findById(subscriptionId).populate("user", "name email phone");
        if (!subscription || !subscription.user) {
            console.error("Subscription or user not found");
            return;
        }

        const daysUntilRenewal = dayjs(subscription.renewalDate).diff(dayjs(), 'day');
        try {
            await transporter.sendMail({
                from: EMAIL_USER,
                to: subscription.user.email,
                subject: `Subscription Renewal Reminder - ${subscription.name}`,
                html: generateReminderEmailTemplate(subscription.user, subscription, daysUntilRenewal)
            });
            console.log("Email reminder sent successfully");
        } catch (error) {
            console.error("Error sending email reminder:", error);
        }
    });
}