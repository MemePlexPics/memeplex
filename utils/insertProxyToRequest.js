import { SocksProxyAgent } from 'socks-proxy-agent';

export const insertProxyToRequest = (request, protocol, host, port) => {
    if (protocol === 'http') {
        request.proxy = {
            host,
            port,
            protocol: 'http',
        };
    } else {
        request.httpAgent = new SocksProxyAgent(`socks://${host}:${port}`, {
            protocol,
        });
        request.httpsAgent = request.httpAgent;
    }
};
