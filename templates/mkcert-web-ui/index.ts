import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const sessionSecret = randomString(48);
  const authPassword = input.authPassword ?? randomPassword();

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
          port: 3000,
        },
      ],
      env: [
        "PORT=3000",
        "HTTPS_PORT=3443",
        "HOST=0.0.0.0",
        "ENABLE_HTTPS=false",
        "SSL_DOMAIN=localhost",
        "FORCE_HTTPS=false",
        "NODE_ENV=production",
        "DEFAULT_THEME=dark",
        `ENABLE_AUTH=${String(input.enableAuth)}`,
        `AUTH_USERNAME=${input.authUsername}`,
        `AUTH_PASSWORD=${authPassword}`,
        `SESSION_SECRET=${sessionSecret}`,
        "CLI_RATE_LIMIT_WINDOW=900000",
        "CLI_RATE_LIMIT_MAX=10",
        "API_RATE_LIMIT_WINDOW=900000",
        "API_RATE_LIMIT_MAX=100",
        "AUTH_RATE_LIMIT_WINDOW=900000",
        "AUTH_RATE_LIMIT_MAX=5",
        `ENABLE_OIDC=${String(input.enableOidc)}`,
        `OIDC_ISSUER=${input.oidcIssuer ?? ""}`,
        `OIDC_CLIENT_ID=${input.oidcClientId ?? ""}`,
        `OIDC_CLIENT_SECRET=${input.oidcClientSecret ?? ""}`,
        `OIDC_CALLBACK_URL=${input.oidcCallbackUrl ?? ""}`,
        `OIDC_SCOPE=${input.oidcScope ?? "openid profile email"}`,
        "# EMAIL_NOTIFICATIONS_ENABLED=true",
        "# SMTP_HOST=smtp.gmail.com",
        "# SMTP_PORT=587",
        "# SMTP_SECURE=false",
        "# SMTP_USER=your-email@domain.com",
        "# SMTP_PASSWORD=your-app-password",
        "# EMAIL_FROM=mkcert@yourcompany.com",
        "# EMAIL_TO=admin@company.com,ops@company.com",
        "# CERT_MONITORING_ENABLED=true",
        "# CERT_CHECK_INTERVAL=0 8 * * *",
        "# CERT_WARNING_DAYS=30",
        "# CERT_CRITICAL_DAYS=7",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "mkcert-certificates",
          mountPath: "/app/certificates",
        },
        {
          type: "volume",
          name: "mkcert-data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
