import 'dotenv/config';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { normalizeServiceUrl } from './app/core/config/url.util';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Expose runtime env for the browser to consume.
app.get('/assets/env.json', (req, res) => {
  res.json({
    apiBaseUrl: normalizeServiceUrl(process.env['AUTH_SERVICE'], 'http://localhost:3001'),
    studyApiUrl: normalizeServiceUrl(process.env['STUDY_SERVICE'], 'http://localhost:8082'),
    talkApiUrl: normalizeServiceUrl(process.env['TALK_SERVICE'], 'http://localhost:3003'),
    talkWsUrl: normalizeServiceUrl(process.env['TALK_WS'], 'ws://localhost:3003/ws/chat'),
    todoApiUrl: normalizeServiceUrl(process.env['TODO_SERVICE'], 'http://localhost:8083'),
    gameWsUrl: normalizeServiceUrl(process.env['GAME_WS'], 'ws://localhost:3002/ws/game'),
    performanceApiUrl: normalizeServiceUrl(
      process.env['PERFORMANCE_SERVICE'],
      'http://localhost:8001',
    ),
    dropoutApiUrl: normalizeServiceUrl(process.env['DROPOUT_SERVICE'], 'http://localhost:8002'),
    aiApiUrl: normalizeServiceUrl(process.env['AI_SERVICE'], 'http://localhost:3008'),
    communityApiUrl: normalizeServiceUrl(process.env['COMMUNITY_SERVICE'], 'http://localhost:3004'),
    materialsApiUrl: normalizeServiceUrl(process.env['MATERIALS_SERVICE'], 'http://localhost:3005'),
    notificationsApiUrl: normalizeServiceUrl(
      process.env['NOTIFICATIONS_SERVICE'],
      'http://localhost:3006',
    ),
    tutoringApiUrl: normalizeServiceUrl(process.env['TUTORING_SERVICE'], 'http://localhost:3007'),
    gamificationApiUrl: normalizeServiceUrl(
      process.env['GAMIFICATION_SERVICE'],
      'http://localhost:5027',
    ),
  });
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
