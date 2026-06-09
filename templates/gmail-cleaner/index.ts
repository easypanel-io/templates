import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const oauthInternalPort = input.oauthInternalPort ?? 8767;
  const oauthExternalPort = input.oauthExternalPort ?? 8767;
  const oauthHost = input.oauthHost?.trim() || "$(PRIMARY_DOMAIN)";
  const webAuth = input.webAuth ?? true;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `WEB_AUTH=${webAuth ? "true" : "false"}`,
        `OAUTH_HOST=${oauthHost}`,
        `OAUTH_EXTERNAL_PORT=${oauthExternalPort}`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: input.credentialsJson,
          mountPath: "/app/credentials.json",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8766,
        },
      ],
      ports: [
        {
          published: oauthExternalPort,
          target: oauthInternalPort,
        },
      ],
    },
  });

  return { services };
}
