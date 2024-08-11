import * as core from "@actions/core";
import { context } from "@actions/github";
import { Open } from "unzipper";
import { LokaliseApi } from "@lokalise/node-api";
import { createPullRequest } from "octokit-plugin-create-pull-request";
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

const { Octokit } = require("@octokit/rest");

const token = core.getInput("token");
const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");

const request = {
  owner: context.repo.owner,
  repo: context.repo.repo,
};

async function run() {
  try {
    const MyOctokit = Octokit.plugin(createPullRequest as any);

    const octokit = new MyOctokit({
      auth: token,
    });

    const lokaliseApi = new LokaliseApi({
      apiKey,
    });

    const response = await lokaliseApi
      .files()
      .download(`${project_id}:master`, {
        format: "json",
        original_filenames: true,
        plural_format: "i18next",
        placeholder_format: "i18n",
      });

    const zipUrl = response.bundle_url;
    const _temp = path.join(path.resolve(), `temp-${new Date().getTime()}`);

    // const zipResponse = await fetch(zipUrl);
    // const zipBuffer = await zipResponse.buffer();
    const zipResponse = await fetch(zipUrl);
    const arrayBuffer = await zipResponse.arrayBuffer();
    const zipBuffer = Buffer.from(arrayBuffer);

    fs.mkdirSync(_temp);
    const zipFilePath = path.join(_temp, "locales.zip");
    fs.writeFileSync(zipFilePath, zipBuffer);

    const directory = await Open.file(zipFilePath);

    const committedFiles = {};
    const files = directory.files.filter((f) => f.type === "File");
    for (const file of files) {
      const content = await file.buffer();
      committedFiles[`locales/${file.path}`] = content.toString();
    }

    const create_response = await octokit.createPullRequest({
      ...request,
      title: `Lokalise update - ${new Date().getTime()}`,
      body: "pull request description",
      head: `lokalise-${new Date().getTime()}`,
      update:
        false /* optional: set to `true` to enable updating existing pull requests */,
      labels: [
        "automerge",
        "build-ignore",
      ] /* optional: applies the given labels when user has permissions. When updating an existing pull request, already present labels will not be deleted. */,
      changes: [
        {
          files: committedFiles,
          commit: "lokalise update",
        },
      ],
    });

    console.log(JSON.stringify({ status: create_response.status }));
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
