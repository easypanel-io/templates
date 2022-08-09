import {
  createTemplate,
  Services,
  bcryptHash
} from "~templates-utils";


export default createTemplate({
  name: "Registry",
  meta: {
    description:
      "The toolset to pack, ship, store, and deliver content. Docker Registry is the Open Source Registry implementation for storing and distributing container images using the OCI Distribution Specification. The goal of this project is to provide a simple, secure, and scalable base for building a large scale registry solution or running a simple private registry. It is a core library for many registry operators including Docker Hub, GitHub Container Registry, GitLab Container Registry and DigitalOcean Container Registry, as well as the CNCF Harbor Project, and VMware Harbor Registry.",
    instructions: `The Registry doesn't have a UI. To interact with the registry you shoult use the Docker CLI.`,
    changeLog: [{ date: "2022-08-09", description: "first release" }],
    links: [
      { label: "Website", url: "https://hub.docker.com/_/registry" },
      { label: "Github", url: "https://github.com/distribution/distribution" },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "serviceName",
      "user",
      "password",
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
        default: "Registry",
      },
      user: {
        type: "string",
        title: "User",
        default: "admin",
      },
      password: {
        type: "string",
        title: "Password",
        default: "admin",
      }
    },
  } as const,
  generate({
    projectName,
    domain,
    serviceName,
    user,
    password,
  }) {
    const services: Services = []

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName,
        source: {
          type: "image",
          image: "registry:2",
        },
        proxy: {
          port: 5000,
          secure: true,
        },
        domains: [{ name: domain }],
        env: [
          `REGISTRY_AUTH=htpasswd`,
          `REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm`,
          `REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd`
        ].join("\n"),
        mounts: [
          { type: 'file', content: `${user}:${bcryptHash(password)}`, mountPath: '/auth/htpasswd' },
          { type: 'volume', name: 'data', mountPath: '/var/lib/registry'}
        ],
        deploy: {
          zeroDowntime: true
        }
      }
    })

    return { services };
  },
});
