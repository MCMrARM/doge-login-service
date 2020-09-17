import grpc from "grpc";
import {NodeRegistryService} from "./rpc/services/NodeRegistryService";

export function startGrpcServer() {
    let server = new grpc.Server();
    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
    new NodeRegistryService(server);
    server.start();
}