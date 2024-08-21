import { LokaliseApi, QueuedProcess } from "@lokalise/node-api";
import { getOctokit, context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

export class Lokalise {
  api: LokaliseApi;
  project_id: string;
  octokit: InstanceType<typeof GitHub>;

  constructor(apiKey: string, project_id: string, ghToken: string) {
    this.octokit = getOctokit(ghToken);
    this.project_id = project_id;
    this.api = new LokaliseApi({
      apiKey,
    });
  }

  private get request() {
    return {
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: context.sha,
    };
  }

  public async uploadToMaster(): Promise<string[]> {
    try {
      const folder = await this.octokit.rest.repos.getContent({
        ...this.request,
        path: "locales/it",
      });

      const base64Files = await Promise.all(
        (folder.data as any)
          .map(async (f: any) => {
            const file = await this.octokit.rest.repos.getContent({
              ...this.request,
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

      let processes: string[] = [];
      for (const file of base64Files) {
        const res = await this.api.files().upload(`${this.project_id}:master`, {
          format: "json",
          lang_iso: "it",
          data: file.base64Content,
          filename: file.fileName,
          replace_modified: true,
          use_automations: true,
        });
        if (res?.process_id) processes.push(res.process_id);
      }
      return processes;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  public async getUploadProcessStatus(
    process_id: string
  ): Promise<QueuedProcess> {
    return this.api
      .queuedProcesses()
      .get(process_id, { project_id: `${this.project_id}:master` });
  }
}
