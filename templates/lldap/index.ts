import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `LLDAP_JWT_SECRET=${jwtSecret}`,
        `LLDAP_LDAP_BASE_DN=dc=example,dc=org`,
        `LLDAP_LDAP_USER_PASS=${input.adminPassword}`,
        `LLDAP_HTTP_PORT=17170`,
        `LLDAP_LDAP_PORT=3389`,
        `RUST_LOG=info`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 17170,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "lldap-data",
          mountPath: "/data",
        },
      ],
      ports: [
        {
          published: Number(input.exposedPort),
          target: 3890,
        },
      ],
    },
  });

  return { services };
}
