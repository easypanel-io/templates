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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/stalwart-mail",
        },
      ],
      ports: [
        { published: input.smtpPort || 25, target: 25 },
        { published: input.smtpSubmissionPort || 587, target: 587 },
        { published: input.smtpTlsPort || 465, target: 465 },
        { published: input.imapPort || 143, target: 143 },
        { published: input.imapsPort || 993, target: 993 },
        { published: input.pop3Port || 110, target: 110 },
        { published: input.pop3sPort || 995, target: 995 },
        { published: input.sievePort || 4190, target: 4190 },
      ],
    },
  });

  return { services };
}
