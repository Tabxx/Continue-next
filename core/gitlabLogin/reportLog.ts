import { Request } from './request';

/**
 * 写入log的请求
 * @param {Object} thsCtx - 上下文信息 
 * @param {Object} logData - log数据
 */
export const thsReportLog = (thsCtx, logData) => {
    const request = new Request(thsCtx);
    thsCtx.log(`[info] report log: ${JSON.stringify(logData)}`);
    return request.post('http://copilot-proxy.myhexin.com/copilot-ai-plugins/stat-logs', logData);
};

/**
 * 上报异常信息
 * @param {Object} param 
 * @param {String} param.errorType - 错误类型
 * @param {String} param.errorMessage - 错误信息
 * @returns 
 */
export const errorReport = (thsCtx, { errorType, errorMessage }) => {
    const errorData = {
        type: 'customError',
        data: {
            errorType,
            errorMessage,
            userOpt: thsCtx.commonBase,
        }
    }
    return thsReportLog(thsCtx, errorData);
}