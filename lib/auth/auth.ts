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
    plugins: [nextCookies()]
})