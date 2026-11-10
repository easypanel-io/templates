import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const cryptKey = randomString(32);

  const jwtKeys = input.jwtPrivateKey && input.jwtPublicKey;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        `POSTGRES_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?sslmode=disable`,
        `CRYPT_KEY=${cryptKey}`,
        `PUBLIC_SCHEME=https`,
        `PUBLIC_PORT=443`,
        ...(jwtKeys
          ? [
              `JWT_PRIVATE_KEY=/app/keys/jwt.key`,
              `JWT_PUBLIC_KEY=/app/keys/jwt.pub`,
            ]
          : []),
      ].join("\n"),
      mounts: jwtKeys
        ? [
            {
              type: "file",
              content: atob(input.jwtPrivateKey!),
              mountPath: "/app/keys/jwt.key",
            },
            {
              type: "file",
              content: atob(input.jwtPublicKey!),
              mountPath: "/app/keys/jwt.pub",
            },
          ]
        : [],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
