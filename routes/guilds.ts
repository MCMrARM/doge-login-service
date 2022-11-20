import express from "express";
import fetch from "node-fetch";
import {NodeEntry, NodeRegistryService} from "../rpc/services/NodeRegistryService.js";
const router = express.Router();

router.get('/', async (req, res, next) => {
    let discordUserId = (req as any).currentUserAuth.discordUserId;
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
        let data: any = await result.json();

        let nodes = new Map<NodeEntry, string[]>();
        for (let guild of data) {
            let node = NodeRegistryService.instance.guildIdToNode[guild.id];
            if (node && !nodes.has(node))
                nodes.set(node, []);
            if (node)
                nodes.get(node)!.push(guild.id);
        }
        let hasPermissionsTo = new Set();
        for (let [node, guildIds] of nodes.entries()) {
            let accessibleGuildIds = await node.client.batchAccessCheck({
                userId: discordUserId,
                guildIds: guildIds
            });
            for (let guildId of accessibleGuildIds)
                hasPermissionsTo.add(guildId);
        }

        let ret: any[] = [];
        for (let guild of data) {
            if (!hasPermissionsTo.has(guild.id))
                continue;
            ret.push({
                id: guild.id,
                name: guild.name,
                icon: guild.icon
            })
        }
        res.json(ret);
    } catch (e) {
        res.status(500).send("");
    }
});

export default router;