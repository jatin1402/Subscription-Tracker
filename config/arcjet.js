import arcjet from "@arcjet/node";
import { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY } from "./env.js";

const aj = arcjet({
    key: ARCJET_KEY,
    characteristics: ["ip.src"], // Track requests by IP
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
            // Block all bots except the following
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
            ],
        }),
        tokenBucket({
            mode: "LIVE",
            refillRate: 1, // Refill 5 tokens per interval
            interval: 10, // Refill every 10 seconds
            capacity: 2, // Bucket capacity of 10 tokens
        }),
    ],
});

export default aj;