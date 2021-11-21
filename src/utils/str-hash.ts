/**
 * 松散的字符串hash
 * @param str
 * @returns 
 */
export function LooseStrId(str = '') { // TODO: 待优化
    const len = str.length;
    // 等距离抽取100个字符进行计算
    const s1 = Math.ceil(len / 100);
    let h1 = 0;
    for (let i = 0; i < len; i += s1) {
        h1 = h1 + str.charCodeAt(i) * i;
    }
    // 等距离抽取20个字符进行计算
    const s2 = Math.ceil(len / 20);
    let h2 = 0;
    for (let j = 1; j < len; j += s2) {
        h2 += str.charCodeAt(j) * (j - 1);
    }
    return `${len}-${h2.toString(16)}-${h1.toString(36)}`;
}