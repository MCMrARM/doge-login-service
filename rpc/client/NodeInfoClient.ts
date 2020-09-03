import {makeSimpleClientConstructor} from "@mrarm/grpc-common";
import {defineClientMethod as defineMethod, extractClientType} from "@mrarm/grpc-common";

type BatchAccessCheckArgs = {
    userId: string,
    guildIds: string[]
}

export const NodeInfoClient = makeSimpleClientConstructor("node", {
    keepalive: defineMethod<{}, {}>(),
    batchAccessCheck: defineMethod<BatchAccessCheckArgs, string[]>()
});
export type NodeInfoClient = extractClientType<typeof NodeInfoClient>;
