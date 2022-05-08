const path = require('path');
const fs = require('fs-extra');
const { spawnSync } = require('child_process');

const DemoCwd = path.resolve(__dirname, '../websites/demo');
const DocumentCwd = path.resolve(__dirname, '../websites/document');
const OutputPath = path.resolve(__dirname, '../dist');

if (!fs.existsSync(OutputPath)) fs.mkdirSync(OutputPath);

(async function () {
  // build pkg for api doc
  spawnSync('pnpm', ['api'], { cwd: process.cwd(), stdio: 'inherit' });
  // build demo
  spawnSync('npx', ['vite', 'build', '--base=/demo/'], { cwd: DemoCwd, stdio: 'inherit' });
  // build document
  spawnSync('npx', ['docusaurus', 'build'], { cwd: DocumentCwd, stdio: 'inherit' });
  fs.moveSync(
    path.resolve(DocumentCwd, './build'),
    OutputPath,
    {overwrite: true}
  );
  fs.moveSync(
    path.resolve(DemoCwd, './dist'),
    path.resolve(OutputPath, './demo'),
    {overwrite: true}
  );
})();





// 上传

