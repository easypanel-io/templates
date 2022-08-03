import { 
  Services,
  createTemplate,
  randomString 
} from "~templates-utils";

export default createTemplate({
  name: "Drone",
  meta: {
    description: "Drone is a Container-Native, Continuous Delivery Platform",
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
    required: ["projectName", "domain", "serviceName", "clientID", "clientSecret"],
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
        default: "drone",
      },
      clientID: {
        type: "string",
        title: "GitHub Oauth Client ID",
        default: "ID",
      },
      clientSecret: {
        type: "string",
        title: "GitHub Oauth Client Secret",
        default: "Secret",
      },
    },
  } as const,
    generate({
      projectName,
      domain,
      serviceName,
      clientID,
      clientSecret,
      RPCsecret = randomString(16),
    }) {
    const services: Services = [];

      services.push({
        type: "app",
        data: {
          projectName,
          serviceName: serviceName,
          env: [
            `DRONE_GITHUB_CLIENT_ID=${clientID}`,
            `DRONE_GITHUB_CLIENT_SECRET=${clientSecret}`,
            `DRONE_SERVER_HOST=${domain}`,
            `DRONE_SERVER_PROTO= https` ,
            `DRONE_RPC_SECRET=${RPCsecret}`
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
              mountPath: "/app/data",
            },
          ],
        },
      });

      return { services };
  },
});