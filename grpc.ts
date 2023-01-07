import grpc from "@grpc/grpc-js";
import {NodeRegistryService} from "./rpc/services/NodeRegistryService.js";
import {config} from "./config.js";

export function startGrpcServer() {
    let server = new grpc.Server();
    server.bindAsync(config.grpcBindTo, grpc.ServerCredentials.createInsecure(), (err, cb) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        new NodeRegistryService(server);
        server.start();
    });
}