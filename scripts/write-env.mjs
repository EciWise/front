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
  studyApiUrl: process.env.STUDY_SERVICE,
  talkApiUrl: process.env.TALK_SERVICE,
  talkWsUrl: process.env.TALK_WS,
  todoApiUrl: process.env.TODO_SERVICE,
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
