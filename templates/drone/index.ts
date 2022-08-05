import { Services, createTemplate, randomString } from "~templates-utils";

export default createTemplate({
  name: "Drone",
  meta: {
    description: "Drone is a Container-Native, Continuous Delivery Platform",
    changeLog: [{ date: "2022-08-04", description: "first release" }],
    links: [
      { label: "Website", url: "https://drone.io/" },
      {
        label: "Documentation",
        url: "https://github.com/harness/drone#setup-documentation",
      },
      { label: "Github", url: "https://github.com/harness/drone" },
    ],
    contributors: [
      { name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" },
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "serviceName",
      "clientID",
      "clientSecret",
      "rpcProtocol",
      "runnerService",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "drone",
      },
      runnerServiceName: {
        type: "string",
        title: "Runner Service Name",
        default: "drone-runner",
      },
      clientID: {
        type: "string",
        title: "GitHub OAuth Client ID",
      },
      clientSecret: {
        type: "string",
        title: "GitHub OAuth Client Secret",
        default: "secret",
      },
      rpcProtocol: {
        type: "string",
        title: "RPC Protocol",
        default: "https",
        oneOf: [
          { enum: ["https"], title: "https" },
          { enum: ["http"], title: "http" },
        ],
      },
      installRunner: {
        type: "boolean",
        title: "Install Runner Service",
        default: false,
      },
      runnerCapacity: {
        type: "number",
        title: "Capacity for runner if enabled",
        default: 2,
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    serviceName,
    runnerServiceName,
    clientID,
    clientSecret,
    rpcProtocol,
    installRunner,
    runnerCapacity,
  }) {
    const services: Services = [];
    const secret = randomString(16);

    if (installRunner) {
      services.push({
        type: "app",
        data: {
          projectName,
          serviceName: `${runnerServiceName}`,
          env: [
            `DRONE_RPC_HOST=${domain}`,
            `DRONE_RPC_PROTO=${rpcProtocol}`,
            `DRONE_RUNNER_CAPACITY=${runnerCapacity}`,
            `DRONE_RPC_SECRET=${secret}`,
          ].join("\n"),
          source: {
            type: "image",
            image: "drone/drone-runner-docker:1",
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
        projectName,
        serviceName: serviceName,
        env: [
          `DRONE_GITHUB_CLIENT_ID=${clientID}`,
          `DRONE_GITHUB_CLIENT_SECRET=${clientSecret}`,
          `DRONE_SERVER_HOST=${domain}`,
          `DRONE_SERVER_PROTO=${rpcProtocol}`,
          `DRONE_RPC_SECRET=${secret}`,
        ].join("\n"),
        source: {
          type: "image",
          image: "drone/drone:2",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
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
  },
});
