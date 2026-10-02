import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Generate a cryptographically secure secret without importing node modules.
  // Templates are bundled by the Easypanel catalog's Next.js application.
  const secretBytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(secretBytes);
  const mcpAccessToken = Array.from(secretBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  services.push({
    type: "app",
    data: {
      serviceName: input.serviceName,
      source: {
        type: "github",
        owner: "jaison",
        repo: "github-projects-bridge",
        ref: "main",
        path: "/",
        autoDeploy: true,
      },
      build: {
        type: "dockerfile",
        file: "Dockerfile",
      },
      env: [
        `GITHUB_TOKEN=${input.githubToken}`,
        `MCP_ACCESS_TOKEN=${mcpAccessToken}`,
        `GITHUB_OWNER=${input.githubOwner}`,
        "PORT=3000",
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [],
    },
  });

  return { services };
}
