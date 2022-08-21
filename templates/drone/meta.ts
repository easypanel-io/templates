// Generated using "yarn build-templates"

export const meta = {
  name: "Drone",
  description: "Drone is a Container-Native, Continuous Delivery Platform",
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
      "serviceName",
      "clientID",
      "clientSecret",
      "rpcProtocol",
      "runnerServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      serviceName: { type: "string", title: "Service Name", default: "drone" },
      runnerServiceName: {
        type: "string",
        title: "Runner Service Name",
        default: "drone-runner",
      },
      clientID: { type: "string", title: "GitHub OAuth Client ID" },
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
  },
};

export type ProjectName = string;
export type Domain = string;
export type ServiceName = string;
export type RunnerServiceName = string;
export type GitHubOAuthClientID = string;
export type GitHubOAuthClientSecret = string;
export type RPCProtocol = RPCProtocol1 & RPCProtocol2;
export type RPCProtocol1 = Https | Http;
export type Https = "https";
export type Http = "http";
export type RPCProtocol2 = string;
export type InstallRunnerService = boolean;
export type CapacityForRunnerIfEnabled = number;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  serviceName: ServiceName;
  runnerServiceName: RunnerServiceName;
  clientID: GitHubOAuthClientID;
  clientSecret: GitHubOAuthClientSecret;
  rpcProtocol: RPCProtocol;
  installRunner?: InstallRunnerService;
  runnerCapacity?: CapacityForRunnerIfEnabled;
}
