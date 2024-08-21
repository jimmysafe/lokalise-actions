import * as core from "@actions/core";
// import { getOctokit, context } from "@actions/github";
import { Lokalise } from "../../../lib/lokalise";
// import { LokaliseApi, QueuedProcess } from "@lokalise/node-api";

const myToken = core.getInput("token");
// const octokit = getOctokit(myToken);

const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");

// const request = {
//   owner: context.repo.owner,
//   repo: context.repo.repo,
//   ref: context.sha,
// };

// class Lokalise {
//   api: LokaliseApi;
//   constructor() {
//     this.api = new LokaliseApi({
//       apiKey,
//     });
//   }

//   public async uploadToMaster(): Promise<string[]> {
//     try {
//       const folder = await octokit.rest.repos.getContent({
//         ...request,
//         path: "locales/it",
//       });

//       const base64Files = await Promise.all(
//         (folder.data as any)
//           .map(async (f: any) => {
//             const file = await octokit.rest.repos.getContent({
//               ...request,
//               path: f.path,
//               mediaType: {
//                 format: "raw",
//               },
//             });
//             const base64Content = Buffer.from(file.data.toString()).toString(
//               "base64"
//             );

//             return {
//               fileName: f.name,
//               base64Content,
//             };
//           })
//           .filter(Boolean)
//       );

//       let processes = [];
//       for (const file of base64Files) {
//         const res = await this.api.files().upload(`${project_id}:master`, {
//           format: "json",
//           lang_iso: "it",
//           data: file.base64Content,
//           filename: file.fileName,
//           replace_modified: true,
//           use_automations: true,
//         });
//         if (res?.process_id) processes.push(res.process_id);
//       }
//       return processes;
//     } catch (error) {
//       console.log(error);
//       return [];
//     }
//   }

//   public async getUploadProcessStatus(
//     process_id: string
//   ): Promise<QueuedProcess> {
//     return this.api
//       .queuedProcesses()
//       .get(process_id, { project_id: `${project_id}:master` });
//   }
// }

async function run() {
  try {
    const lokalise = new Lokalise(apiKey, project_id, myToken);

    console.log("[UPLOADING FILES]");
    const processes = await lokalise.uploadToMaster();
    console.log("[PROCESSED FILES]: ", processes);

    console.log("[CHECKING PROCESS COMPLETION]");
    let allCompleted = false;
    do {
      allCompleted = true;
      for (const process of processes) {
        const p = await lokalise.getUploadProcessStatus(process);
        console.log(`[${p.process_id}] -> ${p.status.toUpperCase()}`);
        if (p?.status !== "finished") {
          allCompleted = false;
        }
      }
    } while (!allCompleted);

    console.log("[PROCESS COMPLETED]");
  } catch (err) {
    if (err.code !== 400) {
      core.setFailed(err.message);
    }
    core.info(err.message);
  }
}

run();
