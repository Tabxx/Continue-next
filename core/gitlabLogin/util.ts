import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * 判断是否为Windows盘符
 * @param {String} path 
 * @returns 
 */
export const isWindowsDriveLetter = (path) => {
    return (
        ((path.charCodeAt(0) >= 65 && path.charCodeAt(0) <= 90) ||
            (path.charCodeAt(0) >= 97 && path.charCodeAt(0) <= 122)) &&
        path.charCodeAt(1) === 58
    );
}

/**
 * 生成uuid
 * @returns
 */
export const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;

        return v.toString(16);
    });
};

/**
 * 格式化盘符为小写，只有window系统有效，其余返回原地址
 * @param {String} filePath - 文件路径
 * @returns 
 */
export const formatDriveLetter = filePath => {
    if(filePath && os.platform() === 'win32') {
        return path.win32.normalize(filePath.charAt(0).toLowerCase() + filePath.slice(1));
    } else {
        return filePath;
    }
}

/**
 * 格式化uri
 * @param {*} uri 
 */
export const formatUri = uri => {
    if (uri.startsWith('file://')) {
        uri = uri.replace('file://', '');
    }
    if (os.platform() === 'win32') {
        // Windows操作系统需要删掉最前面的/
        return formatDriveLetter(uri.slice(1));
    } else {
        return uri;
    }
}


/**
 * 本地日志写入，方便intellij、xcode日志调试
 */
export class ThsLogger {
    fileName = '';
    loggerDir = '';
    init = false;
    constructor(fileName, loggerDir) {
        this.fileName = fileName || 'thsLogger.log';
        // 默认为用户目录
        this.loggerDir = loggerDir || os.userInfo().homedir;
        this.init = true;
    }

    log(...args) {
        if(!this.init) {
            return;
        }
        const message = this.formatLogContent(args);
        this.appendFile(message);
    }

    /**
     * 格式化日志内容
     * @param {*} message - 日志信息
     * @returns 
     */
    formatLogContent(...message) {
        // 当前时间
        const timestamp = new Date().toLocaleString();
        // 构造日志条目
        const logEntry = `[${timestamp}] ${message.join(' | ')}\n`;

        return logEntry;
    }

    /**
     * 写入日志文件
     * @param {String} logEntry - 日志内容
     */
    appendFile(logEntry) {
        // 设置日志文件路径
        const logFilePath = path.join(this.loggerDir, this.fileName);
        // 尝试写入日志条目
        fs.appendFile(logFilePath, logEntry, (err) => {});
    }
}