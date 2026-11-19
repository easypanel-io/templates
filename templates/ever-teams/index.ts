import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `GAUZY_API_SERVER_URL=${input.gauzyApiServerUrl}`,
        `NEXT_PUBLIC_GAUZY_API_SERVER_URL=${input.nextPublicGauzyApiServerUrl}`,
        `NODE_ENV=production`,
        `NEXT_PUBLIC_DEMO=${input.nextPublicDemo}`,
        `NEXT_PUBLIC_CAPTCHA_TYPE=${input.nextPublicCaptchaType}`,
        `NEXT_PUBLIC_CAPTCHA_SITE_KEY=${input.nextPublicCaptchaSiteKey}`,
        `CAPTCHA_SECRET_KEY=${input.captchaSecretKey}`,
        `NEXT_PUBLIC_GOOGLE_APP_NAME=${input.nextPublicGoogleAppName}`,
        `GOOGLE_CLIENT_ID=${input.googleClientId || ""}`,
        `GOOGLE_CLIENT_SECRET=${input.googleClientSecret || ""}`,
        `NEXT_PUBLIC_GITHUB_APP_NAME=${input.nextPublicGithubAppName}`,
        `GITHUB_CLIENT_ID=${input.githubClientId || ""}`,
        `GITHUB_CLIENT_SECRET=${input.githubClientSecret || ""}`,
        `NEXT_PUBLIC_FACEBOOK_APP_NAME=${input.nextPublicFacebookAppName}`,
        `FACEBOOK_CLIENT_ID=${input.facebookClientId || ""}`,
        `FACEBOOK_CLIENT_SECRET=${input.facebookClientSecret || ""}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3030,
        },
      ],
    },
  });

  return { services };
}
