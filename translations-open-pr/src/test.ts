import { getOctokit } from "@actions/github";
import { LokaliseApi } from "@lokalise/node-api";

const apiKey = "f65180bcef55eb0fa6bc794421b340dc6dbf0569";
const project_id = "175820916698d77c9ef940.96307178";
const branch_name = "feat/new-branchname";
const myToken = "XXX";
const octokit = getOctokit(myToken);

const request = {
  owner: "jimmysafe",
  repo: "lokalise-poc",
  ref: "refs/pull/3/merge", // feat/new-branchname
};

const lokaliseApi = new LokaliseApi({ apiKey });

async function run() {
  try {
    const folder = await octokit.rest.repos.getContent({
      ...request,
      path: "locales/it",
    });

    const base64Files = await Promise.all(
      (folder.data as any)
        .map(async (f: any) => {
          const file = await octokit.rest.repos.getContent({
            ...request,
            path: f.path,
            mediaType: {
              format: "raw",
            },
          });
          const base64Content = Buffer.from(file.data.toString()).toString(
            "base64"
          );

          return {
            fileName: f.name,
            base64Content,
          };
        })
        .filter(Boolean)
    );

    for (const file of base64Files) {
      const res = await lokaliseApi
        .files()
        .upload(`${project_id}:${branch_name}`, {
          format: "json",
          lang_iso: "it",
          data: file.base64Content,
          filename: file.fileName,
          replace_modified: true,
          tags: [branch_name],
          cleanup_mode: true, // enables deleted keys to be removed from file
        });
      console.log("FILE UPLOAD: ", file.fileName, res.status);
    }
    // // Init class
    // const lokalise = new Lokalise();
    // // Create branch
    // core.info("Creating branch...");
    // await lokalise.createBranch(branch_name);
    // core.info("Uploading files...");
    // // Upload files
    // await lokalise.upload(branch_name);
    // // Create task
    // core.info("Getting target languages...");
    // const langs = await lokalise.getProjectLanguages();
    // const targetLangs = langs.items.filter((lang) => lang.lang_iso !== "it");
    // for (const lang of targetLangs) {
    //   core.info(`Creating ${lang.lang_iso.toUpperCase()} task...`);
    //   await lokalise.createTask(branch_name, lang.lang_iso);
    // }
  } catch (err) {
    console.log(err);
  }
}

run();
