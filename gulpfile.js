const fs = require('fs');
const del = require('del');
const path = require('path');
const { src, dest, series } = require('gulp');
const { spawn } = require('child_process');
const { bundle, createTypes } = require('./scripts/bundle');

const sourceGlobs = [
  'packages/**/*.md',
  'packages/**/*.json',
  '!packages/**/node_modules/**/*',
  '!packages/**/__test__/**/*'
];
const dist = path.resolve(__dirname, './libs');
const source = path.resolve(__dirname, './packages');
const tsConfigPath = path.resolve(__dirname, './tsconfig.json');

/**
 * 删除输出目录
 */
function delOutput() {
  return del(dist);
}

/**
 * ts 编译
 */
async function tsCompile() {
  const dirs = fs.readdirSync(source);
  await Promise.all(dirs.map((dir) => {
    return bundle({
      tsConfigPath,
      inputDir: path.resolve(source, dir),
      outputDir: path.resolve(dist, dir),
    })
  }));
  createTypes(source, dist);
}

/**
 * 文件拷贝
 */
function copyPackge() {
  return (
    src(sourceGlobs)
    .pipe(dest('libs/'))
  );
}

/**
 * 更新包信息
 */
async function updatePackge() {
  const dirs = fs.readdirSync(dist);
  // delete test file
  await Promise.all(dirs.map(dir => {
    return del(path.resolve(dist, dir, '__test__'));
  }));
  const pkgs = dirs.reduce((pre, cur) => {
    const pkgPath = path.resolve(dist, cur, 'package.json')
    const pkgInfo = require(pkgPath);
    pre[pkgInfo.name] = { pkgInfo, pkgPath };
    return pre;
  }, {});
  // update package.json's dependencies
  await Promise.all(Object.entries(pkgs).map(([name, pkg]) => {
    const { pkgInfo, pkgPath } = pkg;
    if (pkgInfo.dependencies) {
      Object.keys(pkgInfo.dependencies).forEach((dep) => {
        if (pkgs[dep]) {
          // replace version
          pkgInfo.dependencies[dep] = pkgs[dep].pkgInfo.version;
          // merge peerDependencies
          if (pkgs[dep].pkgInfo.peerDependencies) {
            pkgInfo.peerDependencies = {
              ...pkgs[dep].pkgInfo.peerDependencies,
              ...pkgInfo.peerDependencies,
            }
          }
        }
      })
    }
    // upate file
    return fs.promises.writeFile(
      pkgPath,
      JSON.stringify(pkgInfo, null, '\t')
    )
  }));
}

/**
 * 运行测试脚本
 */
function testPackage() {
  return spawn('npx', ['jest'], { stdio: 'inherit' })
}

/**
 * 发布包
 */
function releasePackge(cb) {
  cb();
}

const build = series(
  delOutput,
  tsCompile,
  copyPackge,
  updatePackge
);

const test = series(
  delOutput,
  testPackage,
);

const release = series(
  test,
  tsCompile,
  copyPackge,
  updatePackge,
  releasePackge,
);

exports.test = test;
exports.build = build;
exports.release = release;