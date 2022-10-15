import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(16);

  if (input.installRunner) {
    services.push({
      type: "app",
      data: {
        projectName: input.projectName,
        serviceName: input.runnerServiceName,
        env: [
          `DRONE_RPC_HOST=${input.rpcHost}`,
          `DRONE_RPC_PROTO=${input.rpcProtocol}`,
          `DRONE_RUNNER_CAPACITY=${input.runnerCapacity}`,
          `DRONE_RPC_SECRET=${secret}`,
        ].join("\n"),
        source: {
          type: "image",
          image: input.runnerServiceImage,
        },
        proxy: {
          port: 3000,
          secure: true,
        },
        mounts: [
          {
            type: "bind",
            hostPath: "/var/run/docker.sock",
            mountPath: "/var/run/docker.sock",
          },
        ],
      },
    });
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DRONE_GITHUB_CLIENT_ID=${input.clientID}`,
        `DRONE_GITHUB_CLIENT_SECRET=${input.clientSecret}`,
        `DRONE_SERVER_HOST=${input.rpcHost}`,
        `DRONE_SERVER_PROTO=${input.rpcProtocol}`,
        `DRONE_RPC_SECRET=${secret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
