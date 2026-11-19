import { Output, bcryptHash, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const adminPassword = input.adminPassword || randomPassword();
  const adminPasswordHash = bcryptHash(adminPassword);

  const configContent = `debug = false

[ldap]
  enabled = true
  listen = "0.0.0.0:3893"
  tls = false

[ldaps]
  enabled = false
  listen = "0.0.0.0:3894"
  cert = "glauth.crt"
  key = "glauth.key"

[tracing]
  enabled = false

[backend]
  datastore = "config"
  baseDN = "${input.baseDN}"
  anonymousdse = false

[behaviors]
  IgnoreCapabilities = false
  LimitFailedBinds = true
  NumberOfFailedBinds = 3
  PeriodOfFailedBinds = 10
  BlockFailedBindsFor = 60
  PruneSourceTableEvery = 600
  PruneSourcesOlderThan = 600

[[users]]
  name = "${input.adminUsername}"
  uidnumber = 5001
  primarygroup = 5501
  passbcrypt = "${adminPasswordHash}"
  loginShell = "/bin/sh"
  homeDir = "/home/${input.adminUsername}"
  [[users.capabilities]]
    action = "search"
    object = "*"

[[groups]]
  name = "admins"
  gidnumber = 5501

[api]
  enabled = true
  tls = false
  listen = "0.0.0.0:5555"
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "glauth/glauth:v2.5.0",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5555,
        },
      ],
      ports: [
        {
          published: 3893,
          target: 3893,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "file",
          content: configContent,
          mountPath: "/app/config/config.cfg",
        },
      ],
    },
  });

  return { services };
}
