import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
        `USE_POSTGRES_FOR_ANALYTICS=true`,
        `ENVIRONMENT=production`,
        `DJANGO_ALLOWED_HOSTS=*`,
        `ALLOW_ADMIN_INITIATION_VIA_CLI=true`,
        `FLAGSMITH_DOMAIN=$(PRIMARY_DOMAIN)`,
        `DJANGO_SECRET_KEY=secret`,
        `ENABLE_ADMIN_ACCESS_USER_PASS=true`,
        `# PREVENT_SIGNUP=true`,
        `# ALLOW_REGISTRATION_WITHOUT_INVITE=true`,
        `# Google OAuth Configuration`,
        `# Uncomment the following line if enabling Google OAuth`,
        `# DJANGO_SECURE_CROSS_ORIGIN_OPENER_POLICY=same-origin-allow-popups`,
        `# Email Configuration (example, uncomment and modify as needed)`,
        `# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`,
        `# EMAIL_HOST=mail.example.com`,
        `# SENDER_EMAIL=flagsmith@example.com`,
        `# EMAIL_HOST_USER=flagsmith@example.com`,
        `# EMAIL_HOST_PASSWORD=smtp_account_password`,
        `# EMAIL_PORT=587`,
        `# EMAIL_USE_TLS=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 8000,
        },
      ],
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
