import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server/index';

const app = createServer();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // @ts-ignore - Express app can handle Vercel request/response
  return app(req, res);
}
