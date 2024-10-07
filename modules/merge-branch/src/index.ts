import * as core from "@actions/core";
import { context } from "@actions/github";
import { Lokalise } from "../../lokalise/src";

const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");
const branch_name = context.payload.pull_request.head.ref;

async function run() {
  try {
    const lokalise = new Lokalise({
      apiKey,
      project_id,
    });
    // Merge and delete branch
    await lokalise.mergeBranch({
      branch_name,
      target_branch_name: "master",
      delete_branch_after_merge: true,
    });
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
