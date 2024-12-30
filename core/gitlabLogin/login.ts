import { Request } from './request';
import { getUserEmail } from './email';
import { openBrowser } from './openBrower';
import { uuid } from './util';
import { errorReport } from './reportLog';

// 查询用户登录信息的接口
const QUERY_URL = 'http://10.217.165.7/code-cvn/auth/queryUserByEmail';
// gitlab授权登录地址
const GITLAB_LOGIN_URL = 'http://gitlab.myhexin.com/oauth/authorize?response_type=code&client_id=31f6c6f663505adb8978e8c203bd798f9c62604a053530a9d822dd4f0908ff6a&redirect_uri=http%3A%2F%2F10.217.128.15%2Foauth2%2Fresult&scope=read_api';
// 接口轮询间隔
const POLLING_INTERVAL = 1000;
// 最大轮询次数
const MAX_POLL_TIME_SECONDS = 180;

/**
 * 从接口获取登录信息
 * @param {Object} thsCtx 
 * @returns token
 */
export const getLoginInfo = async (thsCtx) => {
    return new Promise(async (resolve) => {
        const request = new Request(thsCtx);
        const email = await getUserEmail(thsCtx);

        request.get(QUERY_URL, {
            email
        }).then(response => {
            const { data, status_code } = response;
            // 有用户信息的情况下，status_code = 0 并且 data 中的 token字段有数据
            const result = status_code === 0 && data;
            thsCtx.log(`[success] ---- getLogin info success, token: ${JSON.stringify(result)}`);
            resolve(result);
        }).catch(error => {
            thsCtx.log('[error] getLoginInfo api error', error.message);
            resolve('');
        });
    });
}

/**
 * 开启轮询获取用户登录信息
 * @param {*} thsCtx 
 * @returns 
 */
const startPolling = async (thsCtx) => {
    let pollCount = 0;

    return new Promise(resolve => {
        thsCtx.log(`[info] startPolling`);
        const intervalId = setInterval(async () => {
            const loginInfo = await getLoginInfo(thsCtx) as any;
    
            if(loginInfo?.token) {
                // 查询到token后清空计时器，并返回token信息
                clearInterval(intervalId);
                thsCtx.log(`[success] ---- startPolling get result success, token: ${loginInfo}`);
                resolve(loginInfo);
            } else if(pollCount < MAX_POLL_TIME_SECONDS) {
                // 最大轮询次数内就继续
                pollCount++;
            } else {
                // 超过最大轮询次数，清空返回计时器并返回空字符串
                clearInterval(intervalId);
                thsCtx.log(`[error] startPolling timeout.`);
                resolve('');
            }
        }, POLLING_INTERVAL);
    });
}

/**
 * 登录提示窗口
 * @param {*} thsCtx 
 * @returns 
 */
const showLoginModal = async (thsCtx) => {
    // thsCtx.notify('Gitlab授权后才能使用Copilot插件');
    console.log('login-start')
    const url = `${GITLAB_LOGIN_URL}&state=${uuid()}`;
    try {
        // 用默认浏览器打开gitlab授权页面
        await openBrowser(thsCtx, url);
        thsCtx.log(`[success] ---- showLoginModal openBrowser success url: ${url}`);
        return true;
    } catch (error) {
        thsCtx.log(`[error] showLoginModal openBrowser errror url: ${url}, message: ${error.message}`);
        errorReport(thsCtx, {
            errorType: 'gitlabLoginOpenBrowerError',
            errorMessage: error.message
        });
        return false;
    }
}

/**
 * 登录gitlab
 * @param {*} thsCtx 
 * @returns 
 */
export const loginToGitlab = async (thsCtx) => {
    thsCtx.log('[info] loginToGitlab start');
    const loginInfo = await getLoginInfo(thsCtx);

    if(loginInfo) {
        // 已存在token则返回true
        return loginInfo;
    }
    
    // 不存在token，打开登录授权页面
    const showLoginModalResult = await showLoginModal(thsCtx);
    if(!showLoginModalResult) {
        return '';
    }

    // 开启轮询获取登录信息
    const result = await startPolling(thsCtx);

    if(result) {
        thsCtx.notify('gitlab授权成功');
        return result;
    } else {
        errorReport(thsCtx, {
            errorType: 'gitlabLoginTimeout',
            errorMessage: 'gitlab login timed out.',
        });
        return '';
    }
}
