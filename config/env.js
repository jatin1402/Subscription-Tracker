import { config } from "dotenv";

// Load environment variables from .env file
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
    PORT,
    SERVER_URL, 
    NODE_ENV, 
    DB_URI, 
    JWT_SECRET, 
    JWT_EXPIRES_IN, 
    ARCJET_KEY, 
    ARCJET_ENV, 
    QSTASH_URL,
    QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY, 
    QSTASH_NEXT_SIGNING_KEY,
    SMTP_HOST,
    SMTP_PORT,
    EMAIL_USER,
    EMAIL_PASS,
} = process.env;

