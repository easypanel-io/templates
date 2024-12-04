import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const traccarXML = `
  <!DOCTYPE properties SYSTEM 'http://java.sun.com/dtd/properties.dtd'>
  <properties>

  <!-- Documentation: https://www.traccar.org/configuration-file/ -->

  <entry key='database.driver'>org.h2.Driver</entry>
  <entry key='database.url'>jdbc:h2:./data/database</entry>
  <entry key='database.user'>sa</entry>
  <entry key='database.password'></entry>

  </properties>
  `;
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
          content: traccarXML,
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
