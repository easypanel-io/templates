import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 8082,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "logs",
          mountPath: "/opt/traccar/logs",
        },
        {
          type: "file",
          content:
            "<!DOCTYPE properties SYSTEM 'http://java.sun.com/dtd/properties.dtd'>\r\n<properties>\r\n\r\n    <!-- Documentation: https://www.traccar.org/configuration-file/ -->\r\n\r\n    <entry key='database.driver'>org.h2.Driver</entry>\r\n    <entry key='database.url'>jdbc:h2:./data/database</entry>\r\n    <entry key='database.user'>sa</entry>\r\n    <entry key='database.password'></entry>\r\n\r\n</properties>",
          mountPath: "/opt/traccar/conf/traccar.xml",
        },
      ],
      ports: [
        {
          protocol: "tcp",
          published: 5000,
          target: 5000,
        },
        {
          protocol: "tcp",
          published: 5150,
          target: 5150,
        },
      ],
    },
  });
  return { services };
}
