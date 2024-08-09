import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function GET(_: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ welcome: true });
}
