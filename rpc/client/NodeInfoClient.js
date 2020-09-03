import { makeSimpleClientConstructor } from "@mrarm/grpc-common";
import { defineClientMethod as defineMethod } from "@mrarm/grpc-common";
export const NodeInfoClient = makeSimpleClientConstructor("node", {
    keepalive: defineMethod(),
    batchAccessCheck: defineMethod()
});
