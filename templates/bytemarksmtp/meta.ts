// Generated using "yarn build-templates"

export const meta = {
  name: "Bytemark SMTP",
  description:
    "This image allows linked containers to send outgoing email. You can configure it to send email directly to recipients, or to act as a smart host that relays mail to an intermediate server (eg, GMail, SendGrid).",
  instructions: null,
  changeLog: [{ date: "2022-12-12", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/BytemarkHosting/docker-smtp/blob/master/README.md",
    },
    { label: "Github", url: "https://github.com/BytemarkHosting/docker-smtp/" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "relayHost",
      "relayPort",
      "relayUsername",
      "relayPassword",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "mail",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "bytemark/smtp",
      },
      relayHost: { type: "string", title: "Relay Host" },
      relayPort: { type: "number", title: "Relay Port" },
      relayUsername: { type: "string", title: "Relay Username" },
      relayPassword: { type: "string", title: "Relay Password" },
    },
  },
  logo: "logo.png",
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type RelayHost = string;
export type RelayPort = number;
export type RelayUsername = string;
export type RelayPassword = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  relayHost: RelayHost;
  relayPort: RelayPort;
  relayUsername: RelayUsername;
  relayPassword: RelayPassword;
}
