#!/usr/bin/env node
// @ts-check
/**
 * Ratchet de lint para ECIWISE-Front.
 *
 * Cuenta los problemas de ESLint (errores + warnings) de TODO el proyecto y los
 * compara contra un baseline versionado en .husky/lint-baseline.json.
 * El push se bloquea si se introducen MÁS problemas que los existentes; los
 * problemas heredados (baseline) no bloquean, pero el conteo nunca puede subir.
 *
 *   node scripts/lint-ratchet.mjs           -> compara contra el baseline (modo hook)
 *   node scripts/lint-ratchet.mjs --write   -> regenera el baseline con el conteo actual
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_FILE = resolve(repoRoot, '.husky/lint-baseline.json');

// Lintea todo el proyecto según los patrones del flat config (eslint.config.mjs).
const ESLINT_ARGS = ['.'];

function getEslintCommand() {
  const localJs = resolve(repoRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (existsSync(localJs)) {
    return {
      cmd: process.execPath,
      args: [localJs, ...ESLINT_ARGS, '-f', 'json'],
    };
  }
  return {
    cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['eslint', ...ESLINT_ARGS, '-f', 'json'],
  };
}

function runEslint() {
  const { cmd, args } = getEslintCommand();
  const res = spawnSync(cmd, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 128,
  });
  if (res.error) {
    console.error('❌ No se pudo ejecutar ESLint:', res.error.message);
    process.exit(2);
  }
  let report;
  try {
    report = JSON.parse(res.stdout);
  } catch {
    console.error('❌ La salida de ESLint no es JSON válido. stderr:\n', res.stderr);
    process.exit(2);
  }
  let errors = 0;
  let warnings = 0;
  for (const file of report) {
    errors += file.errorCount ?? 0;
    warnings += file.warningCount ?? 0;
  }
  return { errors, warnings, total: errors + warnings };
}

const { errors, warnings, total } = runEslint();

if (process.argv.includes('--write')) {
  writeFileSync(
    BASELINE_FILE,
    JSON.stringify({ total, errors, warnings }, null, 2) + '\n',
  );
  console.log(
    `✅ Baseline de lint actualizado: ${total} problemas (${errors} errores, ${warnings} warnings)`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE_FILE)) {
  console.error('❌ No existe .husky/lint-baseline.json. Genéralo con: npm run lint:baseline');
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));

if (total > baseline.total) {
  console.error(`\n❌ Lint: se introdujeron ${total - baseline.total} problema(s) nuevo(s).`);
  console.error(
    `   Baseline permitido: ${baseline.total} | Actual: ${total} (${errors} errores, ${warnings} warnings)`,
  );
  console.error('   Ejecuta "npm run lint" para corregirlos antes de hacer push.\n');
  process.exit(1);
}

if (total < baseline.total) {
  console.log(
    `🎉 Lint mejoró: ${baseline.total} → ${total}. Actualiza el baseline con "npm run lint:baseline" y commitea .husky/lint-baseline.json`,
  );
} else {
  console.log(`✅ Lint OK: ${total} problemas, sin incrementos sobre el baseline (${baseline.total}).`);
}
process.exit(0);
