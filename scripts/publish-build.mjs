import { copyFile, cp } from 'node:fs/promises';
// Keep a dist artifact for Actions and a root copy for branch-based Pages.
await copyFile('dist/index.html', 'index.html');
await cp('dist/assets', 'assets', { recursive: true });
