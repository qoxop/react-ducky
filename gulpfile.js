const fs = require('fs');
const got = require('got');
const del = require('del');
const path = require('path');
const { src, dest, series } = require('gulp');
const { spawn, spawnSync } = require('child_process');
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

async function libsVisitor(cb) {
  const dirs = fs.readdirSync(dist);
  const pkgs = dirs.reduce((pre, cur) => {
    const pkgPath = path.resolve(dist, cur, 'package.json')
    const pkgInfo = require(pkgPath);
    pre[pkgInfo.name] = { pkgInfo, pkgPath };
    return pre;
  }, {});
  return await Promise.all(Object.entries(pkgs).map(async ([name, pkg]) => {
     await cb(name, pkg, pkgs);
  }));
}

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
  // update package.json's dependencies
  await libsVisitor((name, pkg, pkgs) => {
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
  });
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

/**
 * 发布本地包
 */
async function releaseLocalPackage() {
  const { latest } = await got('http://my-npm.com/-/verdaccio/data/sidebar/react-ducky').json();
  const newVersion = latest.version
    .split('.')
    .map((v, index) => (index === 2 ? +v+1 : v))
    .join('.');
  await libsVisitor((name, pkg, pkgs) => {
    const { pkgInfo, pkgPath } = pkg;
    pkgInfo.version = newVersion;
    if (pkgInfo.dependencies) {
      Object.keys(pkgInfo.dependencies).forEach((dep) => {
        if (pkgs[dep]) {
          // replace version
          pkgInfo.dependencies[dep] = newVersion;
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
  });
  const dirs = fs.readdirSync(dist).map(dir => {
    const abs = path.resolve(dist, dir);
    if (fs.statSync(abs).isDirectory()) {
      return abs;
    }
    return '';
  }).filter(Boolean);
  dirs.forEach(dir => {
    console.log(dir)
    spawnSync('npm', ['publish', '--registry=http://my-npm.com/'], { stdio: 'inherit', cwd: dir });
  });
}


/**
 * 测试
 */
const test = series(
  delOutput,
  testPackage,
);

/**
 * 构建
 */
const build = series(
  test,
  tsCompile,
  copyPackge,
  updatePackge
);

/**
 * 发布正式包
 */
const release = series(
  build,
  releasePackge,
);

/**
 * 发布本地包
 */
const releaseLocal = series(
  build,
  releaseLocalPackage
)

exports.test = test;
exports.build = build;
exports.release = release;
exports.releaseLocal = releaseLocal;