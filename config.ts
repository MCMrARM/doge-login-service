export const config = {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    nginxHost: process.env.NGINX_HOST,
    redirectUri: "https://" + process.env.NGINX_HOST + "/auth/discord",
    authCookieKey: Buffer.from(process.env.AUTH_COOKIE_KEY!, "base64"),
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY!,
    jwtPublicKey: process.env.JWT_PUBLIC_KEY!
};

