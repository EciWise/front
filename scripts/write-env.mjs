import 'dotenv/config';

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const outputPath = join(process.cwd(), 'public', 'assets', 'env.json');

mkdirSync(dirname(outputPath), { recursive: true });

const payload = {
  apiBaseUrl: "https://" + process.env.AUTH_SERVICE,
  studyApiUrl: process.env.STUDY_SERVICE,
  talkApiUrl: process.env.TALK_SERVICE,
  talkWsUrl: process.env.TALK_WS,
  todoApiUrl: process.env.TODO_SERVICE,
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
