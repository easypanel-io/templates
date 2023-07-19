import { copy } from "fs-extra";
import { mkdir, rm, writeFile } from "fs/promises";
import { escape } from "lodash";
import * as path from "path";
import templates from "../templates";

const docsPath = path.resolve(__dirname, "../docs");
const templatesPath = path.resolve(__dirname, "../templates");

async function run() {
  try {
    await rm(docsPath, { recursive: true, force: true });
  } catch {}
  await mkdir(docsPath);

  const list = [];

  // create a folder for each template
  for (let { slug, meta } of templates) {
    await mkdir(path.resolve(docsPath, slug), { recursive: true });

    const lines: string[] = [
      "---",
      `hide_title: true`,
      `sidebar_label: ${meta.name}`,
      `title: ${meta.name} | Self-Host on Easypanel`,
      `description: How to install ${meta.name} on Easypanel? 1-Click installation template for ${meta.name} on Easypanel`,
      "---",
      "",
      "<!-- generated -->",
      "",
    ];

    lines.push(`# ${meta.name}`, "");
    lines.push(
      `1-Click installation template for ${meta.name} on Easypanel`,
      ""
    );

    if (meta?.description) {
      lines.push("## Description", "", escape(meta.description), "");
    }

    if (meta?.instructions) {
      lines.push("## Instructions", "", escape(meta.instructions), "");
    }
    if ("benefits" in meta) {
      lines.push("## Benefits", "");
      meta.benefits.forEach((entry) => {
        lines.push(`- ${entry.title}: ${entry.description}`);
      });
      lines.push("");
    }
    if ("features" in meta) {
      lines.push("## Features", "");
      meta.features.forEach((entry) => {
        lines.push(`- ${entry.title}: ${entry.description}`);
      });
      lines.push("");
    }
    if (meta?.links?.length) {
      lines.push("## Links", "");
      meta.links.forEach((entry) => {
        lines.push(`- [${entry.label}](${entry.url})`);
      });
      lines.push(
        `- [Template Source](https://github.com/easypanel-io/templates/tree/main/templates/${slug})`
      );
      lines.push("");
    }

    {
      lines.push(
        "## Options",
        "",
        "Name | Description | Required | Default Value",
        "-|-|-|-"
      );
      Object.entries(meta.schema.properties).forEach((entry: any) => {
        const [key, value] = entry;
        if (key === "projectName") return;
        lines.push(
          `${value.title ?? key} | ${value.description ?? "-"} | ${
            meta.schema.required.includes(key as any) ? "yes" : "no"
          } | ${value.default ?? ""}`
        );
      });
      lines.push("");
    }

    if (meta.screenshots) {
      lines.push("## Screenshots", "");
      meta.screenshots.forEach((screenshot) => {
        lines.push(`![${meta.name} Screenshot](./assets/${screenshot})`);
      });
      lines.push("");
    }

    if (meta?.changeLog?.length) {
      lines.push("## Change Log", "");
      meta.changeLog.forEach((entry) => {
        lines.push(`- ${entry.date} – ${entry.description}`);
      });
      lines.push("");
    }

    if (meta?.contributors?.length) {
      lines.push("## Contributors", "");
      meta.contributors.forEach((entry) => {
        lines.push(`- [${entry.name}](${entry.url})`);
      });
      lines.push("");
    }

    const filePath = path.resolve(docsPath, slug, "index.md");
    const content = lines.join("\n");

    await writeFile(filePath, content);
    try {
      await copy(
        path.resolve(templatesPath, slug, "assets"),
        path.resolve(docsPath, slug, "assets")
      );
    } catch {}

    list.push({
      slug,
      logo: meta.logo,
      name: meta.name,
      description: meta.description,
    });
  }

  await writeFile(
    path.resolve(docsPath, "templates.json"),
    JSON.stringify(list, null, 2)
  );

  await writeFile(
    path.resolve(docsPath, "_category_.json"),
    JSON.stringify({ label: "Templates" }, null, 2)
  );
}

run().catch(console.error);
