import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Handles all incoming webhooks coming from lokalise
 * @param req
 * @param res
 * @returns
 */
export default async function POST(req: VercelRequest, res: VercelResponse) {
  try {
    //   const ok = checkLokaliseHeaders(req);
    //   if (!ok) return res.status(401).json({ error: "Unauthorized" });
    //   console.log("Event triggered: ", req.body.event);
    //   const response = await triggerGithubEvent(req.body.event, req);
    return res.status(201).json({ payload: req.body });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ error: err?.message ?? "Something went wrong" });
  }
}
