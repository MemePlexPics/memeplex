import { checkProxy } from '../utils';
import { updateProxy } from '../../../utils/mysql-queries';

export const checkProxyArray = async (
    mysql,
    proxies,
    ipWithoutProxy,
    logger,
) => {
    for (const proxy of proxies) {
        const result = await checkProxy(proxy, ipWithoutProxy, logger);
        await updateProxy(
            mysql,
            `${proxy.ip}:${proxy.port}`,
            proxy.protocol,
            result.availability,
            result.anonymity,
            result.speed,
            result.lastCheckDatetime,
        );
    }
};
