import { randomBytes } from "node:crypto";
import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Generated once when the template is instantiated.
  // Easypanel stores the environment value with the service configuration.
  const oauthSigningSecret = randomBytes(32).toString("hex");

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
        `GITHUB_OWNER=${input.githubOwner}`,
        `PUBLIC_URL=https://$(EASYPANEL_DOMAIN)`,
        `GITHUB_OAUTH_CLIENT_ID=${input.githubOAuthClientId}`,
        `GITHUB_OAUTH_CLIENT_SECRET=${input.githubOAuthClientSecret}`,
        `OAUTH_ALLOWED_GITHUB_USERS=${input.oauthAllowedGithubUsers}`,
        `OAUTH_SIGNING_SECRET=${oauthSigningSecret}`,
        "OAUTH_DATA_FILE=/data/oauth-state.json",
        "PORT=80",
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "oauth-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
