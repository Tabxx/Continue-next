import os from 'os'
import { exec } from 'child_process'

const commandMap = {
    'win32': url => `start "" "${url}"`,
    'linux': url => `xdg-open "${url}"`
}

/**
 * 生成指令
 * @param {String} url - 打开的地址
 * @returns 
 */
const generateCmd = url => {
    let defaultCmd = `open "${url}"`;
    const platform = os.platform();
    const commandFun = commandMap[platform];

    if(commandFun) {
        return commandFun(url);
    } else {
        return defaultCmd;
    }
}

/**
 * 打开默认浏览器
 * @param {Object} thsCtx 
 * @param {String} url - 打开的地址
 * @returns 
 */
export const openBrowser = (thsCtx, url) => {
    return new Promise((resolve, reject) => {
        const command = generateCmd(url);
        // 默认浏览器打开
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                thsCtx.log(`[error] openBrowser error. error: ${error}, stderr: ${stderr}`);
                reject(error || stderr);
            }
            thsCtx.log(`[success] ---- openBrowser success.`);
            resolve(stdout);
        });
    });
}