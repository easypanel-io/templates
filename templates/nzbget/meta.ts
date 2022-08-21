// Generated using "yarn build-templates"

export const meta = {
  name: "Nzbget",
  description:
    "NZBGet is a binary downloader, which downloads files from Usenet based on information given in nzb-files.NZBGet is written in C++ and is known for its performance and efficiency.NZBGet can run on almost any device - classic PC, NAS, media player, SAT-receiver, WLAN-router, etc. The download area provides precompiled binaries for Windows, macOS, Linux (compatible with many CPUs and platform variants), FreeBSD and Android.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://nzbget.net/" },
    { label: "Documentation", url: "https://nzbget.net/documentation" },
    { label: "Github", url: "https://github.com/nzbget/nzbget" },
  ],
  contributors: [
    { name: "Ponky", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "domain",
      "username",
      "password",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "nzbget",
      },
      domain: { type: "string", title: "Domain" },
      username: { type: "string", title: "Username", default: "nzbget" },
      password: { type: "string", title: "Password", default: "tegbzn6789" },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/London",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type Username = string;
export type Password = string;
export type Timezone = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
  username: Username;
  password: Password;
  serviceTimezone?: Timezone;
}
