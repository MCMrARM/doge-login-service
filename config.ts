export const config = {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    publicUri: process.env.PUBLIC_URI,
    redirectUri: process.env.PUBLIC_URI + "/auth/discord",
    authCookieKey: Buffer.from(process.env.AUTH_COOKIE_KEY!, "base64"),
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY!,
    jwtPublicKey: process.env.JWT_PUBLIC_KEY!
};
