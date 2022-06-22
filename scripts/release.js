/**
 * update api doc
 */
 const fs = require('fs-extra');
 const path = require('path');
 const { spawnSync } = require('child_process');
 
 const PACKAGE_FOLDER = path.resolve(__dirname, '../package');
 const RELEASE_FOLDER = path.resolve(__dirname, '../package/lib');
 const README_MD = path.resolve(__dirname, '../README.md');
 const ApiDocTemp = path.resolve(PACKAGE_FOLDER, './.api-doc');

 (async function () {
   // build package
   spawnSync('pnpm', ['build'], { cwd: PACKAGE_FOLDER, stdio: 'inherit' });
   await fs.remove(ApiDocTemp);
   await fs.copyFile(README_MD, path.resolve(RELEASE_FOLDER, './README.md'));
   spawnSync('npm', ['publish'], { cwd: RELEASE_FOLDER, stdio: 'inherit' })
 })();
 
 