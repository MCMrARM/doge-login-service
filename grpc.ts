import grpc from "@grpc/grpc-js";
import {NodeRegistryService} from "./rpc/services/NodeRegistryService.js";

export function startGrpcServer() {
    let server = new grpc.Server();
    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
    new NodeRegistryService(server);
    server.start();
}