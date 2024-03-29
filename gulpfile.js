const fs = require('fs-extra');
const got = require('got');
const del = require('del');
const path = require('path');
const { src, dest, series } = require('gulp');
const { spawn, spawnSync } = require('child_process');
const { bundle, createTypes } = require('./scripts/bundle');
const { Extractor, ExtractorConfig } = require("@microsoft/api-extractor");

const sourceGlobs = [
  'packages/**/*.md',
  'packages/**/*.json',
  '!packages/**/node_modules/**/*',
  '!packages/**/__test__/**/*'
];
const dist = path.resolve(__dirname, './libs');
const source = path.resolve(__dirname, './packages');
const tsConfigPath = path.resolve(__dirname, './tsconfig.json');
const localRegistry = 'https://npm.qoxop.run/'

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
 * 更新版本
 */
function updateVersion(cb) {
  // npx changeset version
  spawnSync('npx', ['changeset', 'version'], { stdio: 'inherit' });
  // check status
  const { stdout } = spawnSync('git', ['status'], { encoding: 'utf-8', stdio: 'inherit' });
  // if unclean, add & commit & tag & push
  if (!/working tree clean/.test(stdout)) {
    spawnSync('git', ['add', '.'], { stdio: 'inherit' });
    spawnSync('git', ['commit', '-m="update version [skip actions]"', '--no-verify'], { stdio: 'inherit' });
    spawnSync('npx', ['changeset', 'tag'], { stdio: 'inherit' });
    spawnSync('git', ['push', '--follow-tags', '--no-verify'], { stdio: 'inherit' });
  }
  cb();
}


/**
 * 发布包
 */
function releasePackge(cb) {
  const dirs = fs.readdirSync(dist).map(dir => {
    const abs = path.resolve(dist, dir);
    if (fs.statSync(abs).isDirectory()) {
      return abs;
    }
    return '';
  }).filter(Boolean);
  
  dirs.forEach(dir => {
    fs.copySync(path.resolve(__dirname, '.npmrc'), path.resolve(dir, '.npmrc'));
    spawnSync('npm', ['publish', '--registry=https://registry.npmjs.org/'], { stdio: 'inherit', cwd: dir });
  });
  cb();
}

/**
 * 发布本地包
 */
async function releaseLocalPackage() {
  let latestVersion = '6.6.6'
  try {
    const { latest: version } = await got(`${localRegistry}-/verdaccio/data/sidebar/react-ducky`).json()
    latestVersion = version;
  } catch (error) {
    console.warn(error);
  }
  const newVersion = latestVersion
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
    spawnSync('npm', ['publish', `--registry=${localRegistry}`], { stdio: 'inherit', cwd: dir });
  });
}

/**
 * 创建文档
 */
async function createDocument() {
  const packages = ['react-bfcache', 'react-controller', 'redux-model'];
  const names = {
    'react-bfcache': 'rc-bfcache',
    'react-controller': 'rc-controller',
    'redux-model': 'rd-model',
  };
  const jsonTpl = fs.readFileSync(
    path.resolve(__dirname, './api-extractor.json'),
    { encoding: 'utf-8' }
  );
  packages.forEach(item => {
    const pkgPath = path.resolve(dist, item);
    const jsonPath = path.resolve(pkgPath,'api-extractor.json');
    const entryFile = path.resolve(pkgPath,'index.d.ts');
    const apiTemPath = path.resolve(pkgPath, 'temp');
    const outFile = path.resolve(apiTemPath, 'index.d.ts');
    const tsconfigFilePath = path.resolve(pkgPath, 'tsconfig.json');
    const documentPath = path.resolve(__dirname, 'document', item);
    const jsonStr = jsonTpl.replace(
      '__ENTRY_POINT_FILE_PATH__',
      entryFile
    ).replace(
      '__PUBLIC_TRIMMED_FILE_PATH__',
      outFile
    );
    
    fs.writeFileSync(jsonPath,  jsonStr);
    fs.writeFileSync(
      tsconfigFilePath,
      fs.readFileSync(tsConfigPath, { encoding: 'utf-8' }).replace('packages/', '')
    )
    Extractor.invoke(
      ExtractorConfig.loadFileAndPrepare(jsonPath),
      {
          localBuild: true,
          showVerboseMessages: true
      }
    );
    spawnSync('npx', ['api-documenter', 'markdown', '-i', './', '-o', documentPath], { cwd: apiTemPath });
    fs.copyFileSync(path.resolve(documentPath, `${names[item]}.md`), path.resolve(documentPath, 'README.md'));
  })
}


/**
 * 测试任务
 */
const TestTask = series(delOutput, testPackage);

/**
 * 构建任务
 */
const BuildTask = series(TestTask, tsCompile, copyPackge, updatePackge);

/**
 * 发布正式包任务
 */
const ReleaseTask = series(BuildTask, releasePackge);

/**
 * 发布本地包任务
 */
const ReleaseLocalTask = series(BuildTask, releaseLocalPackage);

/**
 * 生成文档任务
 */
const DocumentTask = series(BuildTask, createDocument, delOutput);

/**
 * 版本发布任务
 */
const VersionTask = series(testPackage, updateVersion);

exports.test = TestTask;
exports.build = BuildTask;
exports.document = DocumentTask;
exports.release = ReleaseTask;
exports.version = VersionTask;
exports.releaseLocal = ReleaseLocalTask;