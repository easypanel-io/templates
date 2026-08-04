import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

function hashAdminPassword(password: string): string {
  const crypto = require("crypto");
  const iterCount = 100000;
  const saltSize = 16;
  const subkeySize = 32;
  const salt = crypto.randomBytes(saltSize);
  const subkey = crypto.pbkdf2Sync(
    password,
    salt,
    iterCount,
    subkeySize,
    "sha256"
  );
  const output = Buffer.alloc(13 + saltSize + subkeySize);
  output[0] = 0x01;
  output.writeUInt32BE(1, 1);
  output.writeUInt32BE(iterCount, 5);
  output.writeUInt32BE(saltSize, 9);
  salt.copy(output, 13);
  subkey.copy(output, 13 + saltSize);
  return output.toString("base64");
}

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const jwtKey = randomString(32);
  const dataProtectionCertPass = randomString(32);
  const adminPasswordHash = hashAdminPassword(input.adminPassword);
  const adminPasswordSecret = `${adminPasswordHash}|${new Date().toISOString()}`;

  const dbHost = `$(PROJECT_NAME)_${input.appServiceName}-db`;
  const dbEnv = [
    `POSTGRES_HOST=${dbHost}`,
    `POSTGRES_PORT=5432`,
    `POSTGRES_DATABASE=$(PROJECT_NAME)`,
    `POSTGRES_USER=postgres`,
  ];
  const dbPasswordMount = {
    type: "file" as const,
    content: dbPassword,
    mountPath: "/secrets/postgres_password",
  };

  const appDomain = input.appDomain || "$(EASYPANEL_DOMAIN)";
  const privateEmailDomains = input.privateEmailDomains || "";
  const smtpAdvertisedHostname = input.smtpAdvertisedHostname || appDomain;
  const publicRegistrationEnabled = input.publicRegistrationEnabled !== false;

  const caddyFile = `
http://{$PRIMARY_DOMAIN} {
    handle /api* {
        reverse_proxy {$API_HOST}:3001
    }

    handle /admin* {
        reverse_proxy {$ADMIN_HOST}:3002 {
            header_up X-Forwarded-Prefix /admin/
        }
    }

    handle {
        reverse_proxy {$CLIENT_HOST}:3000
    }
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-caddy`,
      source: { type: "image", image: "caddy:2.11.4-alpine" },
      env: [
        `PRIMARY_DOMAIN=${appDomain}`,
        `API_HOST=$(PROJECT_NAME)_${input.appServiceName}-api`,
        `ADMIN_HOST=$(PROJECT_NAME)_${input.appServiceName}-admin`,
        `CLIENT_HOST=$(PROJECT_NAME)_${input.appServiceName}-client`,
      ].join("\n"),
      domains: [
        {
          host: appDomain,
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: caddyFile,
          mountPath: "/etc/caddy/Caddyfile",
        },
        {
          type: "volume",
          name: "caddy-data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-client`,
      source: {
        type: "image",
        image: `ghcr.io/aliasvault/client:${input.aliasvaultVersion}`,
      },
      env: [
        `PRIVATE_EMAIL_DOMAINS=${privateEmailDomains}`,
        `HIDDEN_PRIVATE_EMAIL_DOMAINS=`,
        `PUBLIC_REGISTRATION_ENABLED=${publicRegistrationEnabled}`,
        `SUPPORT_EMAIL=${input.supportEmail || ""}`,
        `DEPLOYMENT_MODE=easypanel`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-api`,
      source: {
        type: "image",
        image: `ghcr.io/aliasvault/api:${input.aliasvaultVersion}`,
      },
      env: [
        ...dbEnv,
        `PRIVATE_EMAIL_DOMAINS=${privateEmailDomains}`,
        `HIDDEN_PRIVATE_EMAIL_DOMAINS=`,
        `PUBLIC_REGISTRATION_ENABLED=${publicRegistrationEnabled}`,
        `IP_LOGGING_ENABLED=true`,
        `MAX_UPLOAD_SIZE_MB=100`,
      ].join("\n"),
      mounts: [
        dbPasswordMount,
        {
          type: "file",
          content: jwtKey,
          mountPath: "/secrets/jwt_key",
        },
        {
          type: "file",
          content: dataProtectionCertPass,
          mountPath: "/secrets/data_protection_cert_pass",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-admin`,
      source: {
        type: "image",
        image: `ghcr.io/aliasvault/admin:${input.aliasvaultVersion}`,
      },
      env: [...dbEnv, `IP_LOGGING_ENABLED=true`].join("\n"),
      mounts: [
        dbPasswordMount,
        {
          type: "file",
          content: dataProtectionCertPass,
          mountPath: "/secrets/data_protection_cert_pass",
        },
        {
          type: "file",
          content: adminPasswordSecret,
          mountPath: "/secrets/admin_password_hash",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-smtp`,
      source: {
        type: "image",
        image: `ghcr.io/aliasvault/smtp:${input.aliasvaultVersion}`,
      },
      env: [
        ...dbEnv,
        `PRIVATE_EMAIL_DOMAINS=${privateEmailDomains}`,
        `SMTP_ADVERTISED_HOSTNAME=${smtpAdvertisedHostname}`,
        `SMTP_TLS_ENABLED=false`,
      ].join("\n"),
      mounts: [dbPasswordMount],
      ports: [
        { protocol: "tcp", published: 25, target: 25 },
        { protocol: "tcp", published: 587, target: 587 },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-taskrunner`,
      source: {
        type: "image",
        image: `ghcr.io/aliasvault/task-runner:${input.aliasvaultVersion}`,
      },
      env: dbEnv.join("\n"),
      mounts: [dbPasswordMount],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  return { services };
}
