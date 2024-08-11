import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit } from "@octokit/rest";

export type ParsedTaskDescription = {
  owner: string;
  repo: string;
  pull_number: number;
  ref: string;
};

export type LokaliseTaskResponse = {
  event: string;
  task: {
    id: number;
    type: string;
    title: string;
    description: string;
    due_date: null;
  };
  project: {
    id: string;
    name: string;
    branch: string;
  };
  user: {
    full_name: string;
    email: string;
  };
  created_at: Date;
  created_at_timestamp: number;
};

/**
 * Handles all TASK RELATED incoming webhooks from lokalise
 * @param req
 * @param res
 * @returns
 */
export default async function POST(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(JSON.stringify(req.body));
    const payload = req.body as LokaliseTaskResponse;
    if (!payload.task?.description)
      return res.status(200).json({ error: "Bad request. Empty GH Data" });

    const gh_data = JSON.parse(
      payload.task.description
    ) as ParsedTaskDescription;

    if (!payload || !gh_data)
      return res.status(400).json({ error: "Bad request. Empty body" });

    const token = req.headers.gh_token;

    const octokit = new Octokit({
      auth: token,
    });

    const githubResponse = await octokit.actions.createWorkflowDispatch({
      owner: gh_data.owner,
      repo: gh_data.repo,
      workflow_id: "task-changed.yml",
      ref: gh_data.ref,
      inputs: {
        task_id: payload.task.id.toString(),
      },
    });

    console.log("Github response", githubResponse);

    return res.status(200).json({ message: "OK" });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ error: err?.message ?? "Something went wrong" });
  }
}
