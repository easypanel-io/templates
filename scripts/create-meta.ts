import axios from "axios";
import { createWriteStream } from "fs";
import { mkdir, writeFile } from "fs/promises";
import * as readlineSync from "readline-sync";

interface Item {
  title: string;
  description: string;
}

async function promptItems(category: string): Promise<Item[]> {
  const items: Item[] = [];
  let addMore = true;

  console.log(`Enter ${category} (leave title empty to finish):`);

  while (addMore) {
    const title = readlineSync.question(`Enter ${category} title: `);
    if (!title) {
      addMore = false;
      continue;
    }

    const description = readlineSync.question(
      `Enter ${category} description: `
    );
    items.push({ title, description });
  }

  return items;
}

function promptTags(): string[] {
  const tagOptions = [
    "Analytics",
    "Blog",
    "Bookmarks",
    "Business Apps",
    "Calendars",
    "Chat",
    "Other",
  ];

  const selectedTags: string[] = [];

  while (true) {
    const index = readlineSync.keyInSelect(
      tagOptions,
      'Select tags (Press "0" to finish)',
      { cancel: "Finish" }
    );

    if (index === -1) break; // User pressed cancel

    if (tagOptions[index] === "Other") {
      const customTag = readlineSync.question("Enter custom tag: ");
      if (customTag) {
        selectedTags.push(customTag);
      }
    } else {
      selectedTags.push(tagOptions[index]);
    }
  }

  return selectedTags;
}

function validateUrl(url: string): string {
  if (!url.startsWith("http://") || !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}

async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });

  const writer = createWriteStream(filename);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function promptUser() {
  let metaYaml = "";
  const name = readlineSync.question("Enter project name: ");

  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  const description = readlineSync.question("Enter project description: ", {
    defaultInput: "",
  });
  const instructions = readlineSync.question("Enter instructions: ", {
    defaultInput: "null",
  });
  const logoUrl = validateUrl(
    readlineSync.question("Enter logo URL (blank for none): ")
  );
  const screenshotUrl = validateUrl(
    readlineSync.question("Enter screenshot URL (blank for none): ")
  );
  const today = new Date();
  const changelogDate = today.toISOString().split("T")[0];
  const websiteUrl = validateUrl(
    readlineSync.question("Enter website URL (blank for none): ")
  );
  const demoUrl = validateUrl(
    readlineSync.question("Enter demo URL (blank for none): ")
  );
  const documentationUrl = validateUrl(
    readlineSync.question("Enter documentation URL (blank for none): ")
  );
  const githubUrl = validateUrl(
    readlineSync.question("Enter GitHub URL (blank for none): ")
  );
  const contributorName = readlineSync.question("Enter contributor name: ");
  const contributorUrl = validateUrl(
    readlineSync.question("Enter contributor URL: ")
  );
  const appServiceName = readlineSync.question(
    "Enter app service name for schema: ",
    { defaultInput: "answer" }
  );
  const appServiceImage = readlineSync.question(
    "Enter app service image for schema: ",
    { defaultInput: "answerdev/answer:1.0.9" }
  );

  const benefits = await promptItems("benefits");
  const features = await promptItems("features");

  const tags = promptTags();

  metaYaml += `
name: ${name}
description: ${description}
instructions: ${instructions}
changeLog:
  - date: ${changelogDate}
    description: first release
links:\n`;
  if (websiteUrl) {
    metaYaml += `  - label: Website
    url: ${websiteUrl}\n`;
  }
  if (demoUrl) {
    metaYaml += `  - label: Demo
    url: ${demoUrl}\n`;
  }
  if (documentationUrl) {
    metaYaml += `  - label: Documentation
    url: ${documentationUrl}\n`;
  }
  if (githubUrl) {
    metaYaml += `  - label: Github
    url: ${githubUrl}\n`;
  }
  metaYaml += `\ncontributors:
  - name: ${contributorName}
    url: ${contributorUrl}
schema:
  type: object
  required:
    - projectName
    - appServiceName
    - appServiceImage
  properties:
    projectName:
      type: string
      title: Project Name
    appServiceName:
      type: string
      title: App Service Name
      default: ${appServiceName}
    appServiceImage:
      type: string
      title: App Service Image
      default: ${appServiceImage}\n`;

  function appendItems(items: Item[], category: string) {
    metaYaml += `${category}:\n`;
    for (const item of items) {
      metaYaml += `  - title: ${item.title}
    description: ${item.description}\n`;
    }
  }

  appendItems(benefits, "benefits");
  appendItems(features, "features");

  metaYaml += `\ntags:\n`;

  for (const tag of tags) {
    metaYaml += `  - ${tag}\n`;
  }

  try {
    await mkdir(`templates/${sanitizedName}`);
    console.log(`${sanitizedName} folder created successfully!`);
  } catch (error) {
    console.error("Error creating directory: ", error);
    return;
  }

  const nameForFile = `templates/${sanitizedName}/meta.yaml`;

  try {
    await writeFile(nameForFile, metaYaml);
    console.log("meta.yaml created successfully!");
  } catch (error) {
    console.error("Error writing file: ", error);
  }

  try {
    await mkdir(`templates/${sanitizedName}/assets`);
    console.log(`${sanitizedName} assets folder created successfully!`);
  } catch (error) {
    console.error("Error creating assets directory: ", error);
    return;
  }

  if (logoUrl) {
    const logoFilename = `templates/${sanitizedName}/assets/logo.png`;
    await downloadImage(logoUrl, logoFilename);
    console.log(`Logo downloaded and saved as ${logoFilename}`);
  }

  if (screenshotUrl) {
    const screenshotFilename = `templates/${sanitizedName}/assets/screenshot.png`;
    await downloadImage(screenshotUrl, screenshotFilename);
    console.log(`Screenshot downloaded and saved as ${screenshotFilename}`);
  }
}

promptUser();
