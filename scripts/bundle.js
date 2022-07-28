const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const ts = require('typescript');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('@rollup/plugin-typescript');

const fileVisitor = (dir, visitor, ignores = [/node_modules/, /__test__/]) => {
  if (ignores.some(item => item.test(dir))) {
    return;
  }
  fs.readdirSync(dir)
  .map(fileName => path.join(dir, fileName))
  .forEach(fileName => {
    if (fs.statSync(fileName).isDirectory()) {
      fileVisitor(fileName, visitor, ignores);
    } else {
      visitor(fileName)
    }
  });
}

async function bundle({
  inputDir,
  outputDir,
  tsConfigPath
}) {
  const files = fs.readdirSync(inputDir);
  const indexName = files.find(item => /index\.tsx?$/.test(item));
  const {
    dependencies = {},
    peerDependencies = {},
  } = require(path.resolve(inputDir, 'package.json'));
  const external = Object.keys({ ...peerDependencies, ...dependencies });
  // compile ts code
  const bundle = await rollup.rollup({
    input: path.resolve(inputDir, indexName),
    plugins: [
      rollupTypescript({
        tsconfig: tsConfigPath,
      }),
      terser(),
    ],
    external,
  });

  await bundle.write({
    sourcemap: true,
    sourcemapFile: path.resolve(outputDir, 'index.js.map'),
    format: 'commonjs',
    file: path.resolve(outputDir, 'index.js'),
  });
  await bundle.write({
    sourcemap: true,
    sourcemapFile: path.resolve(outputDir, 'index.mjs.map'),
    format: 'esm',
    file:  path.resolve(outputDir, 'index.mjs'),
  });
}

function createTypes(source, dist) {
  const rootNames = [];
  fileVisitor(source, (fileName) => rootNames.push(fileName));
  ts.createProgram({
    rootNames,
    options: {
        outDir: dist,
        emitDeclarationOnly: true,
        esModuleInterop: false,
        declaration: true,
        skipLibCheck: true
    }
  }).emit();
}
module.exports = {
  bundle,
  createTypes,
}
