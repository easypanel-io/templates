import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `BLOG_TITLE=https://${input.blogTitle}`,
        `BLOG_NAME=${input.blogName}`,
        `BLOG_NICK=${input.blogNick}`,
        `BLOG_PASS=${input.blogPass}`,
        `BLOG_LANG=${input.blogLang}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
    },
  });

  return { services };
}
