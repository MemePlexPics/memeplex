import { PROXY_LIST_API_URL } from '../../constants/index.js';

export const getProxies = async () => {
    try {
        const response = await fetch(PROXY_LIST_API_URL);
        const proxies = (await response.json()).proxies;
        return proxies
            .filter((proxy) => proxy.alive && proxy.anonymity !== 'transparent')
            .sort((a, b) => a.timeout - b.timeout)
            .map((data) => {
                return {
                    ip: data.ip,
                    port: data.port,
                    protocol: data.protocol,
                };
            });
    } catch (error) {
        throw new Error(`❌ Error fetching proxies: ${error.message}`);
    }
};
