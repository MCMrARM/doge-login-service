import express from "express";
import logger from "morgan";
import sessions from "client-sessions";

import authRouter from './routes/auth.js';
import guildsRouter from './routes/guilds.js';
import internalRouter from './routes/internal.js';
import {config} from "./config.js";

let app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(sessions({
    cookieName: 'currentUserAuth',
    secret: config.authCookieKey,
    duration: 6 * 30 * 24 * 60 * 60 * 1000,
    cookie: {
        path: "/api/v1/auth",
        httpOnly: true
    }
} as any));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3001");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use('/api/v1/auth/guilds', guildsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/internal', internalRouter);

export default app;
