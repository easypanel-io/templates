import { bcryptHash, Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(32);
  const sessionSecret = randomString(32);
  const storageEncryptionKey = randomString(32);

  const configYaml = `server:
  address: 'tcp://:9091'

log:
  level: 'info'

totp:
  issuer: '{{ env "ROOT_DOMAIN" }}'

identity_validation:
  reset_password:
    jwt_secret: '${jwtSecret}'

authentication_backend:
  file:
    path: '/config/users_database.yml'

access_control:
  default_policy: 'deny'
  rules:
    - domain: '*.{{ env "ROOT_DOMAIN" }}'
      policy: 'one_factor'
    - domain: '{{ env "ROOT_DOMAIN" }}'
      policy: 'one_factor'

session:
  secret: '${sessionSecret}'
  cookies:
    - name: 'authelia_session'
      domain: '{{ env "SESSION_DOMAIN" }}'
      authelia_url: '{{ env "AUTHELIA_URL" }}'
      expiration: '1 hour'
      inactivity: '5 minutes'

regulation:
  max_retries: 3
  find_time: '2 minutes'
  ban_time: '5 minutes'

storage:
  encryption_key: '${storageEncryptionKey}'
  local:
    path: '/data/db.sqlite3'

notifier:
  filesystem:
    filename: '/data/notification.txt'
`;

  const usersYaml = `users:
  admin:
    disabled: false
    displayname: 'Admin User'
    password: '${bcryptHash(input.adminPassword)}'
    email: 'admin@localhost'
    groups:
      - 'admins'
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `X_AUTHELIA_CONFIG_FILTERS=template`,
        `ROOT_DOMAIN=$(EASYPANEL_HOST)`,
        `SESSION_DOMAIN=$(PRIMARY_DOMAIN)`,
        `AUTHELIA_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 9091 }],
      mounts: [
        { type: "volume", name: "data", mountPath: "/data" },
        {
          type: "file",
          content: configYaml,
          mountPath: "/config/configuration.yml",
        },
        {
          type: "file",
          content: usersYaml,
          mountPath: "/config/users_database.yml",
        },
      ],
    },
  });

  return { services };
}
