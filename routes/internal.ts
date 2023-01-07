import express from "express";
import {NodeRegistryService} from "../rpc/services/NodeRegistryService.js";
import {URL} from "url";
const router = express.Router();

router.get('/get-web-addr', async (req, res, next) => {
    let originalUri = req.header('X-Original-URI') || '';

    // Normalize the URL
    try {
        originalUri = new URL(originalUri, 'http://localhost/').pathname;
    } catch(e) {
        originalUri = '';
    }

    if (!originalUri.startsWith('/api/v1/')) {
        res.status(403).send("");
        return;
    }

    originalUri = originalUri.substring('/api/v1/'.length);
    let discordId = parseInt(originalUri.substring(0, originalUri.indexOf('/')));
    if (!discordId) {
        res.status(403).send("");
        return;
    }

    let entry = NodeRegistryService.instance.guildIdToNode[discordId];
    if (!entry) {
        res.status(403).send("");
        return;
    }

    res.status(200).header('X-Web-Addr', entry.webAddress).send("");
});

export default router;