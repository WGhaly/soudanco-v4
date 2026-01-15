// Vercel serverless function entry point
// This file is bundled by vite and used as the API handler

import { createServer } from "./index";

const app = createServer();

export { app };
export { createServer };
