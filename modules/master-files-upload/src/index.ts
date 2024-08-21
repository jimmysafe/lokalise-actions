import * as core from "@actions/core";
import { Lokalise } from "../../lokalise/src";

const ghToken = core.getInput("token");
const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");

const LOG = console.log;

async function run() {
  try {
    const lokalise = new Lokalise(apiKey, project_id, ghToken);

    LOG("[UPLOADING FILES]");
    const processes = await lokalise.upload("master", {
      use_automations: true,
    });
    LOG("[PROCESSED FILES]: ", processes);

    LOG("[CHECKING PROCESS COMPLETION]");
    let allCompleted = false;
    do {
      allCompleted = true;
      for (const process of processes) {
        const p = await lokalise.getUploadProcessStatus("master", process);
        LOG(`[${p.process_id}] -> ${p.status.toUpperCase()}`);
        if (p?.status !== "finished") {
          allCompleted = false;
        }
      }
    } while (!allCompleted);

    LOG("[PROCESS COMPLETED]");
  } catch (err) {
    if (err.code !== 400) {
      core.setFailed(err.message);
    }
    core.info(err.message);
  }
}

run();
