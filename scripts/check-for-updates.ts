import axios from "axios";
import { readFile } from "fs/promises";
import glob from "glob";
import { intersection } from "lodash";
import YAML from "yaml";

async function run() {
  const items = glob
    .sync("./templates/*/meta.yaml")
    .map((item) => item.slice(12, -9));

  for (const item of items) {
    const fileContent = await readFile(
      `./templates/${item}/meta.yaml`,
      "utf-8"
    );

    const meta = YAML.parse(fileContent);
    for (const [key, value] of Object.entries(meta.schema.properties)) {
      if (key.endsWith("Image")) {
        const defaultImage = (value as any).default;
        if (defaultImage === undefined) {
          continue;
        }
        const [image, tag] = defaultImage.split(":");
        const splitImage = image.split("/");

        let namespace, repository;
        if (splitImage.length === 1) {
          namespace = "library";
          repository = splitImage[0];
        } else {
          [namespace, repository] = splitImage;
        }

        await getLatestUpdate(namespace, repository, tag);
        console.log("\n");
      }
    }
  }
}
async function getLatestUpdate(
  namespace: string,
  repository: string,
  currentTag: string
) {
  const currentTagUrl = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repository}/tags/${currentTag}`;
  const latestTagUrl = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repository}/tags/latest`;

  try {
    const currentTagResponse = await axios.get(currentTagUrl);
    const latestTagResponse = await axios.get(latestTagUrl);

    if (currentTagResponse.status === 200 && latestTagResponse.status === 200) {
      await checkForUpdates(
        currentTagResponse.data,
        latestTagResponse.data,
        namespace,
        repository
      );
    } else {
      console.error(
        `Failed to fetch data, status codes: current tag  ${namespace}/${repository}`
      );
    }
  } catch (error) {
    console.error(`Error fetching data: ${namespace}/${repository} NOT FOUND`);
  }
}

async function checkForUpdates(
  currentTagData: Record<string, any>,
  latestTagData: Record<string, any>,
  namespace: string,
  repository: string
) {
  const currentTagDigest = currentTagData.digest;
  const latestTagDigest = latestTagData.digest;
  const currentVersion = currentTagData.name;

  if (currentTagDigest !== latestTagDigest) {
    await findMatchingTagsInImages(namespace, repository);
    // await findMatchingTags(
    //   namespace,
    //   repository,
    //   latestTagDigest,
    //   currentVersion
    // );
  }
}
async function findMatchingTagsInImages(namespace: string, repository: string) {
  const currentTagsUrl = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repository}/tags?page_size=100`;
  const latestTagUrl = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repository}/tags/latest`;

  try {
    const latestTagResponse = await axios.get(latestTagUrl);
    const currentTagsResponse = await axios.get(currentTagsUrl);

    if (
      latestTagResponse.status === 200 &&
      currentTagsResponse.status === 200
    ) {
      const latestTagData = latestTagResponse.data;
      const currentTagsData = currentTagsResponse.data.results;

      const latestImageDigests = latestTagData.images.map(
        (image: any) => image.digest
      );

      console.log(`${namespace}/${repository} can be updated to:`);
      currentTagsData.forEach((tagData: any) => {
        const tagImageDigests = tagData.images.map(
          (image: any) => image.digest
        );
        const commonImageDigests = intersection(
          latestImageDigests,
          tagImageDigests
        );

        if (commonImageDigests.length) {
          console.log(tagData.name);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching data: TAGS in IMAGES");
  }
}

run().catch(console.error);
