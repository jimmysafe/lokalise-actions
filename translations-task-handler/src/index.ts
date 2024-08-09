import * as core from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { LokaliseApi, Task } from "@lokalise/node-api";

//  lokalise webhook task (created/deleted ecc..) -> Vercel Function -> task-opened/task-closed (based on payload) -> calls this file

const myToken = core.getInput("token");
const octokit = getOctokit(myToken);

const task_id = core.getInput("task_id");
const apiKey = core.getInput("lokaliseApiToken");
const project_id = core.getInput("lokaliseProjectId");
const branch_name = context.payload.pull_request.head.ref;

const request = {
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: context.payload.pull_request.number,
};

function getCommentTableRow(task: Task) {
  return `| ${task.title} | ${
    task.status
  } | ([Visit](https://app.lokalise.com/project/${project_id}/?view=multi&filter=task_${
    task.task_id
  }&branch=${branch_name ?? "master"}) |`;
}

async function run() {
  try {
    const api = new LokaliseApi({
      apiKey,
    });

    console.log("[RETRIEVING TASK] ", task_id);
    const task = await api
      .tasks()
      .get(task_id, { project_id: `${project_id}:${branch_name}` });
    if (!task) {
      console.log("[TASK NOT FOUND] Exiting.");
      return;
    }
    console.log("[RETRIEVING PR COMMENTS]");
    const comments = await octokit.rest.issues.listComments({
      ...request,
    });
    console.log("[CHECKING COMMENT ALREADY EXISTS]");
    const comment = comments.data.find((c) =>
      c.body.includes("<!-- LOKALISE_TASKS -->")
    );
    if (!comment) {
      console.log("[COMMENT NOT FOUND: Creating it..]");
      await octokit.rest.issues.createComment({
        ...request,
        body: `
          <!-- LOKALISE_TASKS --> <br />
          <!-- taskIds: %[${task_id}]% --> <br />

          | Name | Status | Preview
          | :--- | :----- | :------ |
          ${getCommentTableRow(task)}
        `,
      });
    } else {
      console.log("[COMMENT ALREADY EXISTS: Updating it..]");
      const regex = /%([^%]+)%/;
      const match = comment.body.match(regex);
      if (!match) {
        console.log("NO REGEX MATCH FOUND");
        return;
      }

      const ids = JSON.parse(match[1]);
      const newIds = [...new Set([...ids, task_id])];
      console.log("NEW TASK IDS: ", newIds);
      const tableLines: string[] = [];
      for (const id of newIds) {
        const task = await api
          .tasks()
          .get(id, { project_id: `${project_id}:${branch_name}` });
        if (task) tableLines.push(getCommentTableRow(task));
      }

      await octokit.rest.issues.updateComment({
        ...request,
        comment_id: comment.id,
        body: `
          <!-- LOKALISE_TASKS --> <br />
          <!-- taskIds: %[${newIds.join(", ")}]% --> <br />

          | Name | Status | Preview
          | :--- | :----- | :------ |
          ${tableLines.join("<br />")}
        `,
      });
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
