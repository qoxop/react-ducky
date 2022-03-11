const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-ts');
const { terser } = require('rollup-plugin-terser');

const InputFile = path.resolve(__dirname, './src/index.ts');

async function build() {
  const bundle = await rollup.rollup({
    input: InputFile,
    plugins: [
      rollupTypescript({
        tsconfig: path.resolve(__dirname, './tsconfig.json'),
      }),
      terser(),
    ],
    external: ['immer', 'react', 'redux']
  });
  await bundle.write({
    format: 'commonjs',
    file: './lib/index.js',
  });
  const pkgJson = require('./package.json');
  delete pkgJson.devDependencies;
  delete pkgJson.scripts;
  fs.writeFileSync(path.resolve(__dirname, './lib/package.json'), JSON.stringify(pkgJson, null, '\t'));
}

build();