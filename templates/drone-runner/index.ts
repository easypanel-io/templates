import { Services, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "Drone Runner",
  meta: {
    description: "Runner for Drone.io",
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
      "host",
      "secret",
      "runners",
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
        title: "App Service Name",
        default: "drone-runner",
      },
      host: {
        type: "string",
        title: "Drone Server Hostname",
        default: "drone.company.com",
      },
      secret: {
        type: "string",
        title: "RPC Secret",
        default: "Secret",
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
      runners: {
        type: "string",
        title: "Runner Capacity",
        default: "2",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    serviceName,
    host,
    secret,
    rpcProtocol,
    runners,
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        env: [
          `DRONE_RPC_HOST=${host}`,
          `DRONE_RPC_PROTO=${rpcProtocol}`,
          `DRONE_RUNNER_CAPACITY=${runners}`,
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
        domains: [{ name: domain }],
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
  },
});
