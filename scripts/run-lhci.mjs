import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Launcher } from 'chrome-launcher';

const tempDir = path.resolve('.tmp', 'lighthouse');
const chromeProfileDir = path.resolve('.tmp', 'chrome-profile');
const chromePort = String(9222 + Math.floor(Math.random() * 1000));
const lhciCli = path.resolve('node_modules', '@lhci', 'cli', 'src', 'cli.js');

await mkdir(tempDir, { recursive: true });
await mkdir(chromeProfileDir, { recursive: true });

const [chromePath] = await Launcher.getInstallations();
if (!chromePath) throw new Error('Chrome installation not found.');

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${chromePort}`,
  `--user-data-dir=${chromeProfileDir}`,
  '--headless=new',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-dev-shm-usage',
  '--disable-gpu',
], {
  stdio: 'ignore',
});

await waitForChrome(chromePort);

const child = spawn(process.execPath, [lhciCli, 'autorun'], {
  env: {
    ...process.env,
    LHCI_CHROME_PORT: chromePort,
    TEMP: tempDir,
    TMP: tempDir,
    TMPDIR: tempDir,
  },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  stopChrome();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

async function waitForChrome(port) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  stopChrome();
  throw new Error('Timed out waiting for Chrome remote debugging port.');
}

function stopChrome() {
  if (chrome.killed) return;
  chrome.kill();
}
