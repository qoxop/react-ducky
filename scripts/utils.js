const fs = require('fs');
const path = require('path');

/**
 * 文件转化并传输
 * @param params.from - 来源
 * @param params.to - 目的地
 * @param params.transform - 转化方法
 * @param params.filter - 过滤器
 * @returns
 */
function filesTransfer({ from, to, transform, filter = () => true }) {
  if (!fs.existsSync(to)) fs.mkdirSync(to);
  const ps = [];
  const items = fs.readdirSync(from, { withFileTypes: true });
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const fromPath = path.join(from, item.name);
    const toPath = path.join(to, item.name);
    if (item.isFile()) {
      ps.push(new Promise((resolve, reject) => {
        if (!filter(fromPath)) return (resolve);
        fs.readFile(fromPath, (rErr, data) => {
          if (rErr) return reject(rErr);
          Promise.resolve(transform(item.name, data)).then((newData) => {
            fs.writeFile(toPath, newData, (wErr) => {
              if (wErr) reject(wErr);
              resolve();
            });
          });
        });
      }));
    } else if (item.isDirectory()) {
      filesTransfer({from: fromPath, to: toPath, transform, filter});
    }
  }
  return Promise.all(ps);
}

module.exports = {
  filesTransfer
}