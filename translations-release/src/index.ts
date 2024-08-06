import * as core from "@actions/core";
import { context } from "@actions/github";
import {
  Branch,
  BranchMerged,
  LokaliseApi,
  PaginatedResult,
} from "@lokalise/node-api";

const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");
const branch_name = context.payload.pull_request.head.ref;

class Lokalise {
  api: LokaliseApi;
  constructor() {
    this.api = new LokaliseApi({
      apiKey,
    });
  }

  private async getProjectBranches(): Promise<PaginatedResult<Branch>> {
    return this.api.branches().list({ project_id });
  }

  private async deleteBranch(branch_id: number): Promise<any> {
    return this.api.branches().delete(branch_id, { project_id });
  }

  public async mergeBranch({
    branch_name,
    target_branch_name,
    delete_branch_after_merge = false,
  }: {
    branch_name: string;
    target_branch_name: string;
    delete_branch_after_merge?: boolean;
  }): Promise<BranchMerged> {
    const branches = await this.getProjectBranches();
    const sourceBrance = branches.items.find((b) => b.name === branch_name);
    const targetBranch = branches.items.find(
      (b) => b.name === target_branch_name
    );
    if (!sourceBrance) throw new Error(`Branch ${branch_name} not found`);
    if (!targetBranch)
      throw new Error(`Branch ${target_branch_name} not found`);

    const res = await this.api.branches().merge(
      sourceBrance.branch_id,
      { project_id },
      {
        target_branch_id: targetBranch.branch_id,
        force_conflict_resolve_using: "source", // feat branch changes will win.,
      }
    );
    if (delete_branch_after_merge && res.branch_merged) {
      await this.deleteBranch(sourceBrance.branch_id);
    }
    return res;
  }
}

async function run() {
  try {
    // Init class
    const lokalise = new Lokalise();
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
