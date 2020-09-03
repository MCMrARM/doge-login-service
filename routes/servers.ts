import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.get('/', async (req, res, next) => {
    let accessToken = (req as any).currentUserAuth.accessToken;
    if (!accessToken) {
        res.status(401).send("");
        return;
    }
    try {
        let result = await fetch("https://discordapp.com/api/v6/users/@me/guilds", {
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        });
        if (result.status !== 200)
            throw Error("status != 200");
        let data = await result.json();
        let ret: any[] = [];
        for (let server of data) {
            ret.push({
                id: server.id,
                name: server.name,
                iconUrl: "https://cdn.discordapp.com/icons" + server.icon + "/guild_icon.png?size=32"
            })
        }
        res.json(ret);
    } catch (e) {
        res.status(500).send("");
    }
});

export default router;