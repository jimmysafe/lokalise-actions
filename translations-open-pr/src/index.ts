import * as core from "@actions/core";
import { getOctokit, context } from "@actions/github";
import {
  Branch,
  Language,
  LokaliseApi,
  PaginatedResult,
  Task,
  UserGroup,
} from "@lokalise/node-api";

//! STEPS:
// - create branch
// - upload files
// - create task

const myToken = core.getInput("token");
const octokit = getOctokit(myToken);

const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");
const branch_name = context.payload.pull_request.head.ref;

const request = {
  owner: context.repo.owner,
  repo: context.repo.repo,
  ref: context.sha,
};

export class Lokalise {
  api: LokaliseApi;
  constructor() {
    this.api = new LokaliseApi({
      apiKey,
    });
  }

  public async createBranch(branch_name: string): Promise<Branch> {
    const branches = await this.api.branches().list({ project_id });
    const existing = branches.items.find((b) => b.name === branch_name);
    if (existing) return existing;
    return this.api.branches().create({ name: branch_name }, { project_id });
  }

  public async upload(branch_name: string) {
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
        const res = await this.api
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
    } catch (error) {
      console.log(error);
    }
  }

  public async createTask(
    branch_name: string,
    lang: string
  ): Promise<Task | null> {
    try {
      const group = await this.getLanguageUserTranslationGroup(lang);
      if (!group) throw new Error(`No user group found for ${lang}`);

      const keys = await this.getUpdatedBranchKeys(branch_name);
      return this.api.tasks().create(
        {
          title: `Update ${lang.toUpperCase()} - ${branch_name}`,
          keys,
          languages: [
            {
              language_iso: lang,
              groups: [group.group_id],
            },
          ],
        },
        { project_id: `${project_id}:${branch_name}` }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async getProjectLanguages(): Promise<PaginatedResult<Language>> {
    return this.api.languages().list({ project_id });
  }

  private async getUpdatedBranchKeys(branch_name: string): Promise<number[]> {
    const res = await this.api.keys().list({
      project_id: `${project_id}:${branch_name}`,
      filter_tags: branch_name,
    });
    return res.items.map((key) => key.key_id);
  }

  private async getProjectUserGroups(): Promise<PaginatedResult<UserGroup>> {
    const project = await this.api.projects().get(project_id);
    return this.api.userGroups().list({ team_id: project.team_id });
  }

  private async getLanguageUserTranslationGroup(lang: string) {
    const groups = await this.getProjectUserGroups();
    return groups.items.find((g) =>
      g.permissions.languages.find((l) => l.is_writable && l.lang_iso === lang)
    );
  }
}

async function run() {
  try {
    // Init class
    const lokalise = new Lokalise();
    // Create branch
    core.info("Creating branch...");
    await lokalise.createBranch(branch_name);
    core.info("Uploading files...");
    // Upload files
    await lokalise.upload(branch_name);
    // Create task
    core.info("Getting target languages...");
    const langs = await lokalise.getProjectLanguages();
    const targetLangs = langs.items.filter((lang) => lang.lang_iso !== "it");
    for (const lang of targetLangs) {
      core.info(`Creating ${lang.lang_iso.toUpperCase()} task...`);
      await lokalise.createTask(branch_name, lang.lang_iso);
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
