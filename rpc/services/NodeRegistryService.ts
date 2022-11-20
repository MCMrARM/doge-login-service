import {registerSimpleService, ServerCall} from "@mrarm/grpc-common";
import grpc from "@grpc/grpc-js";
import {NodeInfoClient} from "../client/NodeInfoClient.js";

type NodeRegisterArgs = {
    connectAddress: string,
    guildIds: string[],
    initial: boolean
}

export class NodeEntry {

    address: string;
    client: NodeInfoClient;
    guilds: string[];
    private wasClosed: boolean = false;

    constructor(address: string, client: NodeInfoClient, guilds: string[]) {
        this.address = address;
        this.client = client;
        this.guilds = guilds;
    }

    startKeepAliveTask(errorCallback: (node: NodeEntry) => void) {
        (async () => {
            try {
                await this.client.keepalive({});
            } catch (e) {
                if (!this.wasClosed)
                    errorCallback(this);
            }
        })();
    }

    close() {
        this.wasClosed = true;
        this.client.close();
    }

}

export class NodeRegistryService {

    static instance: NodeRegistryService;

    addressToNode: {[address: string]: NodeEntry} = {};
    guildIdToNode: {[guildId: string]: NodeEntry} = {};

    constructor(grpc: grpc.Server) {
        NodeRegistryService.instance = this;
        registerSimpleService(grpc, "nodeRegistry", {
            registerNode: this.registerNode.bind(this)
        });
    }

    async registerNode(arg: ServerCall<NodeRegisterArgs>) {
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
        } else {
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
    }

    onNodeDropped(node: NodeEntry) {
        console.error("Lost connection to node: " + node.address);
        delete this.addressToNode[node.address];
        for (let guildId of node.guilds.values()) {
            if (this.guildIdToNode[guildId] === node)
                delete this.guildIdToNode[guildId];
        }
    }

}