import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.serviceName,
      env: [
        `DRONE_RPC_HOST=${input.host}`,
        `DRONE_RPC_PROTO=${input.rpcProtocol}`,
        `DRONE_RUNNER_CAPACITY=${input.runners}`,
        `DRONE_RPC_SECRET=${input.secret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "drone/drone-runner-docker:1",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  return { services };
}
