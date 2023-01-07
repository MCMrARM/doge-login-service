import fs from "fs";
export const config = {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    redirectUri: "https://discord.mrarm.io/auth/discord",
    authCookieKey: Buffer.from(process.env.AUTH_COOKIE_KEY!, "base64"),
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY!,
    jwtPublicKey: process.env.JWT_PUBLIC_KEY!
};

