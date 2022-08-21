// Generated using "yarn build-templates"

export const meta = {
  name: "Drone Runner",
  description: "Runner for Drone.io",
  instructions: null,
  changeLog: [{ date: "2022-08-04", description: "first release" }],
  links: [
    { label: "Website", url: "https://drone.io/" },
    {
      label: "Documentation",
      url: "https://github.com/harness/drone#setup-documentation",
    },
    { label: "Github", url: "https://github.com/harness/drone" },
  ],
  contributors: [{ name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "host",
      "secret",
      "runners",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "drone-runner",
      },
      host: {
        type: "string",
        title: "Drone Server Hostname",
        default: "drone.company.com",
      },
      secret: { type: "string", title: "RPC Secret", default: "Secret" },
      rpcProtocol: {
        type: "string",
        title: "RPC Protocol",
        default: "https",
        oneOf: [
          { enum: ["https"], title: "https" },
          { enum: ["http"], title: "http" },
        ],
      },
      runners: { type: "string", title: "Runner Capacity", default: "2" },
    },
  },
  logo: "logo.svg",
  screenshots: [],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type DroneServerHostname = string;
export type RPCSecret = string;
export type RPCProtocol = RPCProtocol1 & RPCProtocol2;
export type RPCProtocol1 = Https | Http;
export type Https = "https";
export type Http = "http";
export type RPCProtocol2 = string;
export type RunnerCapacity = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  host: DroneServerHostname;
  secret: RPCSecret;
  rpcProtocol?: RPCProtocol;
  runners: RunnerCapacity;
}
