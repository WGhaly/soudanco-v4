import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../dist/api/vercel-build.mjs';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
