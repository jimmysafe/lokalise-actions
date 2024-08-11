import type { VercelRequest, VercelResponse } from "@vercel/node";
import got from "got";
import { Octokit } from "@octokit/rest";
import { LokaliseApi } from "@lokalise/node-api";
import { createPullRequest } from "octokit-plugin-create-pull-request";
import { Open } from "unzipper";

const zipRequestProxy = (options) => {
  const { url, headers } = options;
  const stream = got.stream(url, { headers });
  var proxy = Object.assign(stream, { abort: stream.destroy });
  return proxy;
};

export default async function POST(req: VercelRequest, res: VercelResponse) {
  try {
    const MyOctokit = Octokit.plugin(createPullRequest);

    const token = req.headers.gh_token;

    const octokit = new MyOctokit({
      auth: token,
    });
    const lokaliseApi = new LokaliseApi({
      apiKey: "f65180bcef55eb0fa6bc794421b340dc6dbf0569",
    });

    const response = await lokaliseApi
      .files()
      .download(`175820916698d77c9ef940.96307178:master`, {
        format: "json",
        original_filenames: true,
        plural_format: "i18next",
        placeholder_format: "i18n",
      });

    const directory = await Open.url(
      zipRequestProxy as any,
      response.bundle_url
    );

    console.log("Unzipping locales directory");
    const committedFiles = {};
    const files = directory.files.filter((f) => f.type === "File");
    for (const file of files) {
      const content = await file.buffer();
      committedFiles[`locales/${file.path}`] = content.toString();
    }

    const create_response = await octokit.createPullRequest({
      owner: "jimmysafe",
      repo: "lokalise-poc",
      title: `Lokalise update - ${new Date().getTime()}`,
      body: "pull request description",
      head: `lokalise-${new Date().getTime()}`,
      update:
        false /* optional: set to `true` to enable updating existing pull requests */,
      labels: [
        "automerge",
        "build-ignore",
      ] /* optional: applies the given labels when user has permissions. When updating an existing pull request, already present labels will not be deleted. */,
      changes: [
        {
          files: committedFiles,
          commit: "lokalise update",
        },
      ],
    });

    return res.json({ status: create_response.status });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ error: err?.message ?? "Something went wrong" });
  }
}
