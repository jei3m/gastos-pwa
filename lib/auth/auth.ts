import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/utils/db";
 
export const auth = betterAuth({
    database: db,
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6 
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 10 * 60, // 10mins
        }
    },
    plugins: [nextCookies()],
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: { 
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
})