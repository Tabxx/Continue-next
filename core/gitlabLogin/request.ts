import http from 'http';
import https from 'https';

/**
 * Request class to make GET and POST requests
 */
export class Request {
  _fetch = null;
  timeout: number
  _thsCtx: any
  constructor(thsCtx) {
    this._thsCtx = thsCtx;
    this._fetch = thsCtx.request || ThsFetch;
    this.timeout = 10000;
  }

  get(url, data) {
    const params = new URLSearchParams(data).toString();
    const reqURL = params ? `${url}?${params}` : url;
    this._thsCtx.log(`[request] get: ${reqURL}`);
    return this._fetch(`${reqURL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout
    }).then((response) => response.json());
  }

  post(url, data) {
    this._thsCtx.log(`[request] post: ${url}, data: `, JSON.stringify(data));
    return this._fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      timeout: this.timeout
    }).then((response) => response.json());
  }
}

/**
 * 兼容部分Node环境下没有fetch
 * @param {String} url  - 请求地址
 * @param {Object} options - 请求参数
 * @returns 
 */
export const ThsFetch = (url, options = {} as any) => {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https://') ? https : http;
    const req = httpModule.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          json() {
            return Promise.resolve(JSON.parse(data.toString()));
          }
        });
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    // POST请求写入数据
    if (options.method.toLocaleUpperCase() === 'POST') {
      req.write(options.body);
    }
    req.end();
  });
}