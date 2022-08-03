import { Services, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "Drone Runner",
  meta: {
    description: "Runner for Drone.io",
    changeLog: [{ date: "2022-08-03", description: "first release" }],
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
    required: ["projectName", "domain", "serviceName", "rpcHost", "rpcSecret", "runnerCapacity"],
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
      rpcHost: {
        type: "string",
        title: "Drone Server Hostname",
        default: "drone.company.com",
      },
      rpcSecret: {
        type: "string",
        title: "RPC Secret",
        default: "Secret",
      },
      runnerCapacity: {
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
      rpcHost,
      rpcSecret,
      runnerCapacity,
    }) {
      const services: Services = [];

      services.push({
        type: "app",
        data: {
          projectName,
          serviceName: serviceName,
          env: [
            `DRONE_RPC_HOST=${rpcHost}`,
            `DRONE_RPC_PROTO= https` ,
            `DRONE_RUNNER_CAPACITY=${runnerCapacity}`,
            `DRONE_RPC_SECRET=${rpcSecret}`,
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