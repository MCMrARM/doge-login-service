var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { registerSimpleService } from "@mrarm/grpc-common";
import grpc from "grpc";
import { NodeInfoClient } from "../client/NodeInfoClient";
export class NodeEntry {
    constructor(address, client, guilds) {
        this.wasClosed = false;
        this.address = address;
        this.client = client;
        this.guilds = guilds;
    }
    startKeepAliveTask(errorCallback) {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.keepalive({});
            }
            catch (e) {
                if (!this.wasClosed)
                    errorCallback(this);
            }
        }))();
    }
    close() {
        this.wasClosed = true;
        this.client.close();
    }
}
export class NodeRegistryService {
    constructor(grpc) {
        this.addressToNode = {};
        this.guildIdToNode = {};
        NodeRegistryService.instance = this;
        registerSimpleService(grpc, "nodeRegistry", {
            registerNode: this.registerNode.bind(this)
        });
    }
    registerNode(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Node requested registration: ${arg.request.connectAddress}`);
            if (arg.request.initial) {
                if (arg.request.connectAddress in this.addressToNode) {
                    this.onNodeDropped(this.addressToNode[arg.request.connectAddress]);
                    this.addressToNode[arg.request.connectAddress].close();
                }
            }
            if (!(arg.request.connectAddress in this.addressToNode)) {
                let client = new NodeInfoClient(arg.request.connectAddress, grpc.credentials.createInsecure());
                let node = new NodeEntry(arg.request.connectAddress, client, arg.request.guildIds);
                node.startKeepAliveTask(this.onNodeDropped.bind(this));
                this.addressToNode[arg.request.connectAddress] = node;
                for (let guildId of arg.request.guildIds)
                    this.guildIdToNode[guildId] = node;
            }
            else {
                let node = this.addressToNode[arg.request.connectAddress];
                let newSet = new Set(arg.request.guildIds);
                for (let guildId in node.guilds) {
                    if (!newSet.has(guildId) && this.guildIdToNode[guildId] === node)
                        delete this.guildIdToNode[guildId];
                }
                for (let guildId of arg.request.guildIds)
                    this.guildIdToNode[guildId] = node;
                node.guilds = arg.request.guildIds;
            }
            return {};
        });
    }
    onNodeDropped(node) {
        console.error("Lost connection to node: " + node.address);
        delete this.addressToNode[node.address];
        for (let guildId of node.guilds.values()) {
            if (this.guildIdToNode[guildId] === node)
                delete this.guildIdToNode[guildId];
        }
    }
}
