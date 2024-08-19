import * as core from "@actions/core";
import { getOctokit } from "@actions/github";
import { LokaliseApi, Task } from "@lokalise/node-api";

//  lokalise webhook task (created/deleted ecc..) -> Vercel Function -> task-opened/task-closed (based on payload) -> calls this file

const myToken = core.getInput("token");
const octokit = getOctokit(myToken);

const task_id = core.getInput("task_id");
const gh_data = core.getInput("gh_data");
const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");

const request = JSON.parse(gh_data) as {
  owner: string;
  repo: string;
  pull_number: number;
  ref: string;
};

const branch_name = request.ref;

function formatTaskStatus(status: string) {
  switch (status) {
    case "created":
    case "in progress":
      return "🛠️ In Progress";
    case "completed":
      return "✅ Completed";
    default:
      return status;
  }
}

function getCommentTableRow(task: Task): string {
  return `| ${task.title} | ${formatTaskStatus(
    task.status
  )} | [Visit](https://app.lokalise.com/project/${project_id}/?view=multi&filter=task_${
    task.task_id
  }&branch=${branch_name ?? "master"}) |`;
}

async function generateBranchTasksTableRows(): Promise<string> {
  const api = new LokaliseApi({
    apiKey,
  });

  console.log("[RETRIEVING BRANCH TASKS]");
  const branchTasks = await api
    .tasks()
    .list({ project_id: `${project_id}:${branch_name}` });

  return branchTasks.items
    .map((task) => {
      return getCommentTableRow(task);
    })
    .join("\n");
}

async function run() {
  try {
    console.log("[TASK STATUS CHANGED FOR]: ", task_id);
    const rows = await generateBranchTasksTableRows();

    console.log("[RETRIEVING PR COMMENTS]");
    const comments = await octokit.rest.issues.listComments({
      issue_number: request.pull_number,
      owner: request.owner,
      repo: request.repo,
    });

    console.log("[CHECKING COMMENT ALREADY EXISTS]");
    const comment = comments.data.find((c) =>
      c.body.includes("<!-- LOKALISE_TASKS -->")
    );

    if (!comment) {
      console.log("[COMMENT NOT FOUND]: ", "Creating it..");
      await octokit.rest.issues.createComment({
        issue_number: request.pull_number,
        owner: request.owner,
        repo: request.repo,
        body: `<!-- LOKALISE_TASKS -->\n| Name | Status | Preview\n| :--- | :----- | :------ |\n${rows}`,
      });
    } else {
      console.log("[COMMENT ALREADY EXISTS]: ", "Updating it..");
      await octokit.rest.issues.updateComment({
        ...request,
        comment_id: comment.id,
        body: `<!-- LOKALISE_TASKS -->\n| Name | Status | Preview\n| :--- | :----- | :------ |\n${rows}`,
      });
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
