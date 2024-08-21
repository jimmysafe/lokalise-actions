import * as core from "@actions/core";
import { context } from "@actions/github";
import { Lokalise } from "../../lokalise/src";

const ghToken = core.getInput("token");

const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");
const branch_name = context.payload.pull_request.head.ref;

const LOG = console.log;

async function run() {
  try {
    const lokalise = new Lokalise({
      apiKey,
      project_id,
      ghToken,
    });

    LOG("[CREATING BRANCH]");
    const branch = await lokalise.createBranch(branch_name);
    LOG("[BRANCH CREATED]: ", branch.branch_id);

    LOG("[UPLOADING FILES]");
    const processes = await lokalise.upload(branch_name);
    LOG("[PROCESSED FILES]: ", processes);

    LOG("[CHECKING PROCESS COMPLETION]");
    let allCompleted = false;
    do {
      allCompleted = true;
      for (const process of processes) {
        const p = await lokalise.getUploadProcessStatus(branch_name, process);
        LOG(`[${p.process_id}] -> ${p.status.toUpperCase()}`);
        if (p?.status !== "finished") {
          allCompleted = false;
        }
      }
    } while (!allCompleted);

    LOG("[CREATE TASK X TARGET LANGUAGE]");
    const langs = await lokalise.getProjectLanguages();
    const targetLangs = langs.items.filter((lang) => lang.lang_iso !== "it");
    LOG(`[TARGET LANGUAGES] -> ${targetLangs.map((l) => l.lang_iso)}`);

    for (const lang of targetLangs) {
      LOG(`[CREATING ${lang.lang_iso.toUpperCase()} TASK]`);
      await lokalise.createTask(branch_name, lang.lang_iso);
      LOG(`[SUCCESSFULLY CREATED ${lang.lang_iso.toUpperCase()} TASK]`);
    }
  } catch (err) {
    if (err.code !== 400) {
      core.setFailed(err.message);
    }
    core.info(err.message);
  }
}

run();
