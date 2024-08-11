import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * !TEST! Handles all TASK RELATED incoming webhooks from lokalise
 * @param req
 * @param res
 * @returns
 */
export default async function POST(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(JSON.stringify(req.body));
    return res.status(200).json({ body: req.body });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ error: err?.message ?? "Something went wrong" });
  }
}
