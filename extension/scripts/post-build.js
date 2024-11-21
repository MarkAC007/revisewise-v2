import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function postBuild() {
  try {
    // Ensure icons directory exists
    await mkdir('icons', { recursive: true });
    
    // Copy static files
    await copyFile('src/manifest.json', 'manifest.json');
    await copyFile('src/popup.html', 'popup.html');
    await copyFile('src/styles.css', 'styles.css');
    
    // Copy icons
    const icons = ['16', '32', '48', '128'];
    for (const size of icons) {
      await copyFile(
        join('src', 'icons', `icon${size}.png`),
        join('icons', `icon${size}.png`)
      );
    }

    console.log('Post-build completed successfully');
  } catch (error) {
    console.error('Post-build failed:', error);
    process.exit(1);
  }
}