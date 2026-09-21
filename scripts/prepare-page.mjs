import { copyFile } from 'node:fs/promises';

// GitHub Pages currently serves the repository root. Keep the editable Vite
// entry separate, then place it at the root immediately before Vite bundles it.
await copyFile('index.source.html', 'index.html');
