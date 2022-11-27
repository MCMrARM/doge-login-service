import grpc from "@grpc/grpc-js";
import {NodeRegistryService} from "./rpc/services/NodeRegistryService.js";

export function startGrpcServer() {
    let server = new grpc.Server();
    server.bindAsync("127.0.0.1:50051", grpc.ServerCredentials.createInsecure(), (err, cb) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        new NodeRegistryService(server);
        server.start();
    });
}