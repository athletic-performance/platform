import { spawnSync } from 'node:child_process';

const APP_NAME = 'platform-web';
const bundleId =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? process.env.NEXT_PUBLIC_COMMIT_SHA;

const config = {
  endpoint: process.env.FARO_SOURCEMAP_API_URL,
  appId: process.env.FARO_APP_ID,
  apiKey: process.env.FARO_API_KEY,
  stackId: process.env.FARO_STACK_ID,
  bundleId,
};

const uploadValues = [config.endpoint, config.appId, config.apiKey, config.stackId];
const configuredUploadValues = uploadValues.filter(
  (value) => value !== undefined && value.length > 0,
);

if (configuredUploadValues.length === 0) {
  process.exit(0);
}

const missingVariables = Object.entries(config)
  .filter(([, value]) => value === undefined || value.length === 0)
  .map(([name]) => name);

if (missingVariables.length > 0) {
  throw new Error(`Неполная конфигурация загрузки sourcemaps: ${missingVariables.join(', ')}`);
}

function runFaroCli(args) {
  const result = spawnSync('faro-cli', args, { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Faro CLI завершился с кодом ${String(result.status)}`);
  }
}

runFaroCli([
  'inject-bundle-id',
  '--bundle-id',
  config.bundleId,
  '--app-name',
  APP_NAME,
  '--files',
  '.next/static/**/*.js',
]);

runFaroCli([
  'upload',
  '--endpoint',
  config.endpoint,
  '--app-id',
  config.appId,
  '--api-key',
  config.apiKey,
  '--stack-id',
  config.stackId,
  '--bundle-id',
  config.bundleId,
  '--app-name',
  APP_NAME,
  '--output-path',
  '.next/static',
  '--recursive',
  '--gzip-contents',
]);
