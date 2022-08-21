// Generated using "yarn build-templates"

export const meta = {
  name: "Registry",
  description:
    "The toolset to pack, ship, store, and deliver content. Docker Registry is the Open Source Registry implementation for storing and distributing container images using the OCI Distribution Specification. The goal of this project is to provide a simple, secure, and scalable base for building a large scale registry solution or running a simple private registry. It is a core library for many registry operators including Docker Hub, GitHub Container Registry, GitLab Container Registry and DigitalOcean Container Registry, as well as the CNCF Harbor Project, and VMware Harbor Registry.",
  instructions:
    "The Registry doesn't have a UI. To interact with the registry you should use the Docker CLI.",
  changeLog: [{ date: "2022-08-09", description: "first release" }],
  links: [
    { label: "Website", url: "https://hub.docker.com/_/registry" },
    { label: "Github", url: "https://github.com/distribution/distribution" },
  ],
  contributors: [
    { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "user", "password"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "registry",
      },
      user: { type: "string", title: "User", default: "admin" },
      password: { type: "string", title: "Password", default: "admin" },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type User = string;
export type Password = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  user: User;
  password: Password;
}
