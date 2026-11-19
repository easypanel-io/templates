import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = randomPassword();

  const startScript = `set -eu
if [ ! -f /data/.admin-ready ]; then
  flood --rundir /data --host 127.0.0.1 --port 3001 &
  pid=$!
  node /scripts/setup.js
  kill "$pid"
  wait "$pid" || true
fi
exec flood --rundir /data --port 3000
`;

  const setupScript = `const fs = require("fs");
const base = "http://127.0.0.1:3001/api/auth";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  let verify;
  for (;;) {
    try {
      verify = await fetch(base + "/verify");
      break;
    } catch {
      await sleep(1000);
    }
  }
  const initialUser =
    verify.status === 200 && (await verify.json()).initialUser === true;
  if (initialUser) {
    const response = await fetch(base + "/register?cookie=false", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        level: 10,
        client: {
          client: "qBittorrent",
          type: "web",
          version: 1,
          url: "http://127.0.0.1:8080",
          username: "",
          password: "",
        },
      }),
    });
    if (!response.ok) {
      console.error("Could not create admin: " + response.status + " " + (await response.text()));
      process.exit(1);
    }
    console.log("Admin " + process.env.ADMIN_USERNAME + " created");
  } else {
    console.log("Admin already exists");
  }
  fs.writeFileSync("/data/.admin-ready", "");
})();
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
        `FLOOD_OPTION_RUNDIR=/data`,
        `ADMIN_USERNAME=${input.adminUsername}`,
        `ADMIN_PASSWORD=${adminPassword}`,
      ].join("\n"),
      deploy: {
        command: "sh /scripts/start.sh",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/data",
        },
        {
          type: "file",
          content: startScript,
          mountPath: "/scripts/start.sh",
        },
        {
          type: "file",
          content: setupScript,
          mountPath: "/scripts/setup.js",
        },
      ],
    },
  });

  return { services };
}
