const rollup = require('rollup');
const path = require('path');
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
    external: ['immer', 'react']
  });
  await bundle.write({
    format: 'commonjs',
    file: './lib/index.js',
  });
}
build();