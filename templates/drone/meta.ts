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
      "appServiceName",
      "appServiceImage",
      "runnerServiceName",
      "runnerServiceImage",
      "clientID",
      "clientSecret",
      "rpcHost",
      "rpcProtocol",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "drone",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "drone/drone:2.13.0",
      },
      runnerServiceName: {
        type: "string",
        title: "Runner Service Name",
        default: "drone-runner",
      },
      runnerServiceImage: {
        type: "string",
        title: "Runner Service Image",
        default: "drone/drone-runner-docker:1.8.2",
      },
      clientID: { type: "string", title: "GitHub OAuth Client ID" },
      clientSecret: {
        type: "string",
        title: "GitHub OAuth Client Secret",
        default: "secret",
      },
      rpcHost: { type: "string", title: "RPC Host" },
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
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type RunnerServiceName = string;
export type RunnerServiceImage = string;
export type GitHubOAuthClientID = string;
export type GitHubOAuthClientSecret = string;
export type RPCHost = string;
export type RPCProtocol = RPCProtocol1 & RPCProtocol2;
export type RPCProtocol1 = Https | Http;
export type Https = "https";
export type Http = "http";
export type RPCProtocol2 = string;
export type InstallRunnerService = boolean;
export type CapacityForRunnerIfEnabled = number;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  runnerServiceName: RunnerServiceName;
  runnerServiceImage: RunnerServiceImage;
  clientID: GitHubOAuthClientID;
  clientSecret: GitHubOAuthClientSecret;
  rpcHost: RPCHost;
  rpcProtocol: RPCProtocol;
  installRunner?: InstallRunnerService;
  runnerCapacity?: CapacityForRunnerIfEnabled;
}
