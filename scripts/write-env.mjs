import 'dotenv/config';

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const outputPath = join(process.cwd(), 'public', 'assets', 'env.json');

mkdirSync(dirname(outputPath), { recursive: true });

function stripTrailingSlashes(url) {
  let end = url.length;
  while (end > 0 && url.charAt(end - 1) === '/') {
    end--;
  }
  return url.slice(0, end);
}

function normalizeServiceUrl(value, fallback) {
  const raw = (value ?? fallback).trim() || fallback;
  const url = raw.startsWith('https://http://') ? raw.slice('https://'.length) : raw;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('ws://') ||
    url.startsWith('wss://')
  ) {
    return stripTrailingSlashes(url);
  }

  const protocol =
    url.startsWith('localhost') || url.startsWith('127.0.0.1') ? 'http://' : 'https://';
  return stripTrailingSlashes(`${protocol}${url}`);
}

const payload = {
  apiBaseUrl: normalizeServiceUrl(process.env.AUTH_SERVICE, 'http://localhost:3001'),
  studyApiUrl: normalizeServiceUrl(process.env.STUDY_SERVICE, 'http://localhost:8082'),
  talkApiUrl: normalizeServiceUrl(process.env.TALK_SERVICE, 'http://localhost:3003'),
  talkWsUrl: normalizeServiceUrl(process.env.TALK_WS, 'ws://localhost:3003/ws/chat'),
  todoApiUrl: normalizeServiceUrl(process.env.TODO_SERVICE, 'http://localhost:8083'),
  gameWsUrl: normalizeServiceUrl(process.env.GAME_WS, 'ws://localhost:3002/ws/game'),
  performanceApiUrl: normalizeServiceUrl(process.env.PERFORMANCE_SERVICE, 'http://localhost:8001'),
  dropoutApiUrl: normalizeServiceUrl(process.env.DROPOUT_SERVICE, 'http://localhost:8002'),
  aiApiUrl: normalizeServiceUrl(process.env.AI_SERVICE, 'http://localhost:3008'),
  communityApiUrl: normalizeServiceUrl(process.env.COMMUNITY_SERVICE, 'http://localhost:3004'),
  materialsApiUrl: normalizeServiceUrl(process.env.MATERIALS_SERVICE, 'http://localhost:3005'),
  notificationsApiUrl: normalizeServiceUrl(process.env.NOTIFICATIONS_SERVICE, 'http://localhost:3006'),
  tutoringApiUrl: normalizeServiceUrl(process.env.TUTORING_SERVICE, 'http://localhost:3007'),
  gamificationApiUrl: normalizeServiceUrl(process.env.GAMIFICATION_SERVICE, 'http://localhost:5027'),
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
