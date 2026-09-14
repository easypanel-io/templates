import { Output } from "~templates-utils";
import { Input } from "./meta";

function randomSecret(): string {
  return Array.from(
    globalThis.crypto.getRandomValues(new Uint8Array(32)),
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}

export function generate(input: Input): Output {
  return {
    services: [
      {
        type: "compose",
        data: {
          serviceName: input.serviceName,
          source: {
            type: "git",
            repo: "https://github.com/sarrazola/openlivery.git",
            ref: "codex/easypanel-template",
            rootPath: "/docker/easypanel",
            composeFile: "docker-compose.yml",
          },
          createDotEnv: true,
          env: [
            "FRONTEND_URL=https://$(PRIMARY_DOMAIN)",
            "COOKIE_SECURE=true",
            `POSTGRES_PASSWORD=${randomSecret()}`,
            `SECRET_KEY=${randomSecret()}`,
            `ENCRYPTION_KEY=${randomSecret()}`,
            `WHATSAPP_BRIDGE_TOKEN=${randomSecret()}`,
          ].join("\n"),
          domains: [
            { host: "$(EASYPANEL_DOMAIN)", port: 80, service: "openlivery" },
          ],
        },
      },
    ],
  };
}
