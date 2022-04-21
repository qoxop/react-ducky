const fs = require('fs');
const del = require('del');
const path = require('path');
const ts = require('typescript');
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');
const { terser } = require('rollup-plugin-terser');
const { Extractor, ExtractorConfig } = require("@microsoft/api-extractor");

const TEMP_DIR = path.posix.resolve(__dirname, '../temp');
const OUTPUT_DIR =  path.posix.resolve(__dirname, '../dist');
const INPUT_FILE = path.resolve(__dirname, '../src/index.ts');
const TSCONFIG_FILE = path.resolve(__dirname, '../tsconfig.json');
const API_EXTRACTOR_FILE = path.resolve(__dirname, '../api-extractor.json');
const PACKAGE_JSON = require('../package.json');

const getOutputPath = (subPath) => path.resolve(OUTPUT_DIR, `./${subPath}`);

const fileVisitor = (dir, visitor) => {
  fs.readdirSync(dir)
  .map(fileName => path.join(dir, fileName))
  .forEach(fileName => {
    if (fs.statSync(fileName).isDirectory()) {
      fileVisitor(fileName, visitor);
    } else {
      visitor(fileName)
    }
  });
}


async function bundle() {
  // compile ts code
  const bundle = await rollup.rollup({
    input: INPUT_FILE,
    plugins: [
      rollupTypescript({
        tsconfig: TSCONFIG_FILE,
      }),
      terser(),
    ],
    external: Object.keys(PACKAGE_JSON.peerDependencies)
  });

  // write commonjs module
  await bundle.write({
    sourcemap: true,
    sourcemapFile: getOutputPath('index.js.map'),
    format: 'commonjs',
    file: getOutputPath('index.js'),
  });
  await bundle.write({
    sourcemap: true,
    sourcemapFile: getOutputPath('index.esm.js.map'),
    format: 'esm',
    file: getOutputPath('index.esm.js'),
  });
  await bundle.write({
    sourcemap: false,
    format: 'umd',
    name: 'reactDucky',
    globals: { react: 'React', immer: 'immer',redux: 'Redux' },
    file: getOutputPath('index.umd.js'),
  });

  // copy package.json
  delete PACKAGE_JSON.scripts;
  delete PACKAGE_JSON.publishConfig;
  fs.writeFileSync(
    path.resolve(__dirname, getOutputPath('package.json')),
    JSON.stringify(PACKAGE_JSON, null, '\t')
  );
}

function createTypeFile() {
  const rootNames = [];
  fileVisitor(path.resolve(__dirname, '../src'), (fileName) => rootNames.push(fileName));
  ts.createProgram({
    rootNames,
    options: {
        outDir: TEMP_DIR,
        emitDeclarationOnly: true,
        esModuleInterop: false,
        declaration: true,
        skipLibCheck: true
    }
  }).emit();
  // Run  API Extractor
  Extractor.invoke(
    ExtractorConfig.loadFileAndPrepare(API_EXTRACTOR_FILE),
    {
        localBuild: true,
        showVerboseMessages: true
    }
  );
}

(async function() {
  await del(OUTPUT_DIR)
  await bundle();
  createTypeFile();
  await del(TEMP_DIR);
})();
