# Hermes WebUI — Easypanel Template (Two-Service)

Community Easypanel template deploying **Hermes Agent** + **Hermes WebUI** as two
interoperating services with shared named volumes.

## Directory structure

```
hermes-webui/
├── meta.yaml        # Template schema, metadata, benefits, changelog
├── index.ts         # generate() — produces two Easypanel service definitions
├── README.md        # This file
└── assets/
    ├── logo.png     # Template icon (512×512 PNG)
    └── screenshot.png  # UI screenshot (2000+ px wide PNG)
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Easypanel Project                          │
│                                                                   │
│  ┌─────────────────────────┐   ┌─────────────────────────────┐   │
│  │   hermes-agent          │   │   hermes-webui              │   │
│  │   nousresearch/         │   │   ghcr.io/nesquena/         │   │
│  │   hermes-agent:latest   │   │   hermes-webui:latest       │   │
│  │                         │   │                             │   │
│  │  cmd: gateway run       │   │  port: 8787 → domain        │   │
│  │  (Telegram/Discord/     │   │  auth: HERMES_WEBUI_        │   │
│  │   cron/hooks)           │   │         PASSWORD            │   │
│  └────────────┬────────────┘   └──────────────┬──────────────┘   │
│               │                               │                   │
│        /root/.hermes            /home/hermeswebui/.hermes         │
│               │                               │                   │
│               └───────────┬───────────────────┘                   │
│                           │                                       │
│               ┌───────────▼───────────┐                           │
│               │   hermes-home volume  │  ← shared state:         │
│               │   config, .env,       │    config, sessions,      │
│               │   sessions, memory,   │    memory, skills,        │
│               │   skills, cron, logs  │    cron, API keys         │
│               └───────────────────────┘                           │
│                                                                   │
│               ┌───────────────────────┐                           │
│               │ hermes-agent-src vol  │  ← agent Python source:  │
│               │  agent: /opt/hermes   │    WebUI init script      │
│               │  webui: /.hermes/     │    runs uv pip install    │
│               │         hermes-agent  │    from here on boot      │
│               └───────────────────────┘                           │
│                                                                   │
│               ┌───────────────────────┐                           │
│               │   workspace volume    │  ← files browsable in    │
│               │   webui: /workspace   │    WebUI right panel      │
│               └───────────────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

## How the two services interoperate

**There is no HTTP communication between the agent and WebUI containers.**

Interop is entirely filesystem-based via two shared named volumes:

| Volume | Agent mount | WebUI mount | Purpose |
|---|---|---|---|
| `hermes-home` | `/root/.hermes` | `/home/hermeswebui/.hermes` | Shared config, sessions, memory, skills, cron, API keys |
| `hermes-agent-src` | `/opt/hermes` | `/home/hermeswebui/.hermes/hermes-agent` | Agent Python package source for dep install |

The WebUI's `docker_init.bash` runs `uv pip install /home/hermeswebui/.hermes/hermes-agent`
on first boot, then `server.py` imports Hermes Python modules directly
(`run_agent`, config, models) — it doesn't call the agent container over a port.

The agent container runs `gateway run` as a persistent background process
(Telegram, Discord, cron, hooks) completely independently of the WebUI.

## Schema fields

| Field | Default | Required | Description |
|---|---|---|---|
| `agentServiceName` | `hermes-agent` | ✅ | Easypanel service name for agent |
| `agentServiceImage` | `nousresearch/hermes-agent:latest` | ✅ | Agent Docker image |
| `webuiServiceName` | `hermes-webui` | ✅ | Easypanel service name for WebUI |
| `webuiServiceImage` | `ghcr.io/nesquena/hermes-webui:latest` | ✅ | WebUI Docker image |
| `hermesWebUIPassword` | _(user sets)_ | ✅ | Password for UI authentication |
| `anthropicApiKey` | _(optional)_ | ❌ | Anthropic API key passed as env var |
| `openaiApiKey` | _(optional)_ | ❌ | OpenAI API key passed as env var |
| `defaultModel` | `openai/gpt-4o-mini` | ❌ | Default model in UI selector |
| `botName` | `Hermes` | ❌ | Assistant display name |

## First-time setup notes

1. Start both services. The agent entrypoint bootstraps the data volume on first run.
2. If no API keys were set in the schema, exec into the agent container:
   ```
   docker exec -it <project>_hermes-agent hermes setup
   ```
3. The WebUI first boot installs Python deps — takes ~1–2 min. Check logs if UI doesn't load.
4. Visit the WebUI domain, enter your password, and start chatting.

## Adding to Easypanel

Copy this directory to `templates/hermes-webui/` in a fork of
[easypanel-io/templates](https://github.com/easypanel-io/templates),
run `npm run build`, and submit a PR — or use the built JSON entry as a Custom Template.
