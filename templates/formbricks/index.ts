import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const nextAuthSecret = randomString(32);
  const encryptionKey = randomString(32);
  const appEnv = [
    `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `NEXTAUTH_SECRET=${nextAuthSecret}`,
    `ENCRYPTION_KEY=${encryptionKey}`,
    `WEBAPP_URL=https://$(PRIMARY_DOMAIN)`,
    `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
    `ENTERPRISE_LICENSE_KEY=${input.enterpriseLicenseKey}`,
    `SHORT_URL_BASE=${input.shortUrlBase}`,
    `EMAIL_VERIFICATION_DISABLED=${input.emailVerificationDisabled}`,
    `PASSWORD_RESET_DISABLED=${input.passwordResetDisabled}`,
    `SIGNUP_DISABLED=${input.signUpDisabled}`,
    `EMAIL_AUTH_DISABLED=${input.emailAuthDisabled}`,
    `INVITE_DISABLED=${input.inviteDisabled}`,
    `PRIVACY_URL=${input.privacyPolicyUrl}`,
    `TERMS_URL=${input.termsOfServiceUrl}`,
    `IMPRINT_URL=${input.imprintUrl}`,
    `GITHUB_ID=${input.githubId}`,
    `GITHUB_SECRET=${input.githubSecret}`,
    `GOOGLE_CLIENT_ID=${input.googleClientId}`,
    `GOOGLE_CLIENT_SECRET=${input.googleClientSecret}`,
    `DEFAULT_TEAM_ID=${input.defaultTeamId}`,
    `ONBOARDING_DISABLED=${input.onboardingDisabled}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: "formbricks-app",
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/home/nextjs/apps/web/uploads/",
        },
      ],
      env: appEnv.join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
