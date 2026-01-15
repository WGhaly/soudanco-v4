import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;
let initError: Error | null = null;

try {
  const { createServer } = require('../server/index');
  app = createServer();
} catch (error) {
  initError = error as Error;
  console.error('Failed to initialize server:', error);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (initError) {
    return res.status(500).json({
      error: 'Server initialization failed',
      message: initError.message,
      stack: process.env.NODE_ENV === 'development' ? initError.stack : undefined,
    });
  }
  
  if (!app) {
    return res.status(500).json({ error: 'Server not initialized' });
  }

  return app(req, res);
}
