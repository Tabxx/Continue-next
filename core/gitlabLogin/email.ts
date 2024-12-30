import { exec } from 'child_process'
import path from 'path';
import os from 'os';
import fs from 'fs';

import { errorReport } from './reportLog';

/**
 * 通过Git获取用户邮箱
 * @returns 
 */
const getEmailbyGit = (thsCtx) => {
    return new Promise(resolve => {
        exec('git config --get user.email', (error, stdout, stderr) => {
            if (error || stderr) {
                thsCtx.log(`[error] ---- get email by git error`, error || stderr);
                errorReport(thsCtx, {
                    errorType: 'getEmailbyGitError',
                    errorMessage: `获取邮箱失败：${error || stderr}`
                });
                resolve('');
                return;
            }
            thsCtx.log('[success] ---- get email by git success', stdout);
            resolve(stdout.trim());
        });
    });
}

/**
 * 通过系统获取用户邮箱
 * @returns 
 */
const getEmailbySystem = (thsCtx) => {
    // 格式化邮箱地址
    const formatEmail = (username) => {
        return username.indexOf('@myhexin.com') > -1 ? username : `${username}@myhexin.com`;
    }
    return new Promise(resolve => {
        const platform = os.platform();
        if (platform === 'win32') {
            // windows系统通过net user viruser获取
            exec(`chcp 65001 && net user viruser`, (error, stdout, stderr) => {
                if (error) {
                    thsCtx.log(`[error] ---- net user viruser 执行的错误: ${error || stderr}`);
                    errorReport(thsCtx, {
                        errorType: 'getEmailbySystemError',
                        errorMessage: `获取邮箱失败：${error || stderr}`
                    });
                    resolve('');
                    return;
                }
                // thsCtx.log(`[success] ---- get email by system success ${systemEmail}`);

                const fullNameRegex = /Full Name\s*(.*)/;
                const fullNameMatch = stdout.toString().match(fullNameRegex);
                const fullName = fullNameMatch ? fullNameMatch[1].trim() : '';
                resolve(formatEmail(fullName));
            });
        } else {
            // 其余系统从os.userInfo().username获取
            const username = os.userInfo().username;
            thsCtx.log(`[success] ---- get email by system success ${username}`);
            resolve(formatEmail(username));
        }
    });
}

/**
 * 从用户目录的.gitconfig中获取邮箱
 * 解决Mac系统copilotForXcode无法通过git config --get user.email获取邮箱的问题
 * @returns 
 */
const getEmailByGitConfig = (thsCtx) => {
    try {
        const gitConfigPath = path.join(os.userInfo().homedir, '.gitconfig');
        const gitConfigContent = fs.readFileSync(gitConfigPath, 'utf-8');
        
        const matchResult = gitConfigContent.match(/email\s*=\s*(\S+)/);
        const email = matchResult && matchResult.length > 1 ? matchResult[1] : '';
        thsCtx.log('[success] ---- get email by .gitconfig success', email);
        return email;
    } catch (error) {
        thsCtx.log('[error] ---- get email by .gitconfig error', error.message);
        errorReport(thsCtx, {
            errorType: 'getEmailbyGitConfigError',
            errorMessage: `从.gitconfig获取邮箱失败：${error.message}`
        });
        return '';
    }
}

/**
 * 获取用户邮箱
 */
const _getUserEmail = async (thsCtx) => {
    // 1. 先从git获取邮箱
    const gitEmail = await getEmailbyGit(thsCtx);

    if (gitEmail) {
        return gitEmail;
    }

    // 2. 从用户目录的.gitconfig中获取邮箱
    const gitConfigEmail = getEmailByGitConfig(thsCtx)
    if(gitConfigEmail) {
        return gitConfigEmail;
    }

    // 3. 从系统获取邮箱
    const systemEmail = await getEmailbySystem(thsCtx);
    return systemEmail;
};


/**
 * 获取用户邮箱（暴露给外层使用，添加了缓存）
 */
let cacheEmail = '';
export const getUserEmail = async (thsCtx) => {
    if(cacheEmail) {
        return cacheEmail;
    }

    const userEmail = await _getUserEmail(thsCtx);
    thsCtx.log(`[success] ---- get email success ${userEmail}`);
    cacheEmail = userEmail as string;
    return userEmail;
}