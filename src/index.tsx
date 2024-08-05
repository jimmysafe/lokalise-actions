import * as core from "@actions/core";
import { getOctokit, context } from "@actions/github";
// import path = require("path");

// const myToken = core.getInput("token");
// const octokit = getOctokit(myToken);

const request = {
  repo: context.repo.repo,
  ref: context.ref,
};

async function run() {
  console.log("REQUEST: ", JSON.stringify(request, null, 2));
  console.log("GH CONTEXT: ", JSON.stringify(context, null, 2));
}

run();
