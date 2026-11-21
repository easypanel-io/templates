import type { Output } from "~templates-utils";
import type { Input } from "./meta";

function generateSecret(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export function generate(input: Input): Output {
  return {
    services: [
      {
        type: "app",
        data: {
          serviceName: input.appServiceName,
          source: {
            type: "image",
            image: "ghcr.io/webdecoy/fcaptcha:1.51.1",
          },
          env: [
            `FCAPTCHA_SECRET=${generateSecret()}`,
            `FCAPTCHA_VERIFY_SECRET=${generateSecret()}`,
          ].join("\n"),
          deploy: {
            replicas: 1,
            zeroDowntime: false,
          },
          domains: [
            {
              host: "$(EASYPANEL_DOMAIN)",
              port: 3000,
            },
          ],
        },
      },
    ],
  };
}
