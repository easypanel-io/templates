import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = input.adminPassword || randomPassword();

  const startupScript = `#!/bin/sh
opencloud init || true
opencloud server
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `OC_URL=https://$(PRIMARY_DOMAIN)`,
        `IDM_ADMIN_PASSWORD=${adminPassword}`,
        `OC_LOG_LEVEL=info`,
        `OC_LOG_COLOR=false`,
        `OC_LOG_PRETTY=false`,
        `PROXY_TLS=false`,
        `OC_INSECURE=false`,
        `PROXY_ENABLE_BASIC_AUTH=false`,
        `IDM_CREATE_DEMO_USERS=false`,
        `OC_SHARING_PUBLIC_SHARE_MUST_HAVE_PASSWORD=true`,
        `OC_SHARING_PUBLIC_WRITEABLE_SHARE_MUST_HAVE_PASSWORD=false`,
        `OC_PASSWORD_POLICY_DISABLED=false`,
        `OC_PASSWORD_POLICY_MIN_CHARACTERS=8`,
        `OC_PASSWORD_POLICY_MIN_LOWERCASE_CHARACTERS=1`,
        `OC_PASSWORD_POLICY_MIN_UPPERCASE_CHARACTERS=1`,
        `OC_PASSWORD_POLICY_MIN_DIGITS=1`,
        `OC_PASSWORD_POLICY_MIN_SPECIAL_CHARACTERS=1`,
      ].join("\n"),
      deploy: {
        command: "/bin/sh /start.sh",
      },
      mounts: [
        {
          type: "file",
          content: startupScript,
          mountPath: "/start.sh",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/etc/opencloud",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/opencloud",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9200,
        },
      ],
    },
  });

  return { services };
}
