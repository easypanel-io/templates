import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const name = input.appServiceName;
  const jicofoPassword = randomPassword();
  const jvbPassword = randomPassword();
  const jvbPort = Number(input.jvbPort);
  const domain = `$(PROJECT_NAME)-${name}.$(EASYPANEL_HOST)`;
  const recording = input.enableRecording;
  const jibriRecorderPassword = randomPassword();
  const jibriXmppPassword = randomPassword();
  const recordingEnv = recording ? [`ENABLE_RECORDING=1`] : [];

  const commonEnv = [
    `TZ=UTC`,
    `PUBLIC_URL=https://${domain}`,
    `XMPP_SERVER=${name}-prosody`,
    `XMPP_DOMAIN=meet.jitsi`,
    `XMPP_AUTH_DOMAIN=auth.meet.jitsi`,
    `XMPP_MUC_DOMAIN=muc.meet.jitsi`,
    `XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.jitsi`,
    `XMPP_GUEST_DOMAIN=guest.meet.jitsi`,
    `XMPP_HIDDEN_DOMAIN=hidden.meet.jitsi`,
    `XMPP_RECORDER_DOMAIN=recorder.meet.jitsi`,
    `JVB_BREWERY_MUC=jvbbrewery`,
    `JVB_AUTH_USER=jvb`,
    `JICOFO_AUTH_USER=focus`,
    `JIBRI_BREWERY_MUC=jibribrewery`,
    `JIBRI_RECORDER_USER=recorder`,
    `JIBRI_XMPP_USER=jibri`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: name,
      source: { type: "image", image: input.webServiceImage },
      env: [
        ...commonEnv,
        `DISABLE_HTTPS=1`,
        `ENABLE_HTTP_REDIRECT=0`,
        `ENABLE_LETSENCRYPT=0`,
        `ENABLE_XMPP_WEBSOCKET=1`,
        `XMPP_BOSH_URL_BASE=http://${name}-prosody:5280`,
        `NGINX_RESOLVER=127.0.0.11`,
        ...recordingEnv,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8000 }],
      mounts: [{ type: "volume", name: "config", mountPath: "/config" }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-prosody`,
      source: { type: "image", image: input.prosodyServiceImage },
      env: [
        ...commonEnv,
        `JICOFO_AUTH_PASSWORD=${jicofoPassword}`,
        `JVB_AUTH_PASSWORD=${jvbPassword}`,
        `ENABLE_XMPP_WEBSOCKET=1`,
        `JIBRI_RECORDER_PASSWORD=${jibriRecorderPassword}`,
        `JIBRI_XMPP_PASSWORD=${jibriXmppPassword}`,
        ...recordingEnv,
      ].join("\n"),
      deploy: { zeroDowntime: false },
      mounts: [
        { type: "volume", name: "config", mountPath: "/config" },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/prosody-plugins-custom",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-jicofo`,
      source: { type: "image", image: input.jicofoServiceImage },
      env: [
        ...commonEnv,
        `JICOFO_AUTH_PASSWORD=${jicofoPassword}`,
        ...recordingEnv,
      ].join("\n"),
      deploy: { zeroDowntime: false },
      mounts: [{ type: "volume", name: "config", mountPath: "/config" }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-jvb`,
      source: { type: "image", image: input.jvbServiceImage },
      env: [
        ...commonEnv,
        `JVB_AUTH_PASSWORD=${jvbPassword}`,
        `JVB_PORT=${jvbPort}`,
      ].join("\n"),
      deploy: { zeroDowntime: false },
      ports: [{ published: jvbPort, target: jvbPort, protocol: "udp" }],
      mounts: [{ type: "volume", name: "config", mountPath: "/config" }],
    },
  });

  if (recording) {
    services.push({
      type: "app",
      data: {
        serviceName: `${name}-jibri`,
        source: { type: "image", image: input.jibriServiceImage },
        env: [
          ...commonEnv,
          `DISPLAY=:0`,
          `JIBRI_RECORDER_PASSWORD=${jibriRecorderPassword}`,
          `JIBRI_XMPP_PASSWORD=${jibriXmppPassword}`,
          `JIBRI_RECORDING_DIR=/storage/recordings`,
        ].join("\n"),
        deploy: { zeroDowntime: false },
        mounts: [
          { type: "volume", name: "config", mountPath: "/config" },
          { type: "volume", name: "recordings", mountPath: "/storage" },
          { type: "bind", hostPath: "/dev/shm", mountPath: "/dev/shm" },
        ],
      },
    });
  }

  return { services };
}
