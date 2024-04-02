import { findExistedProxy, insertProxy } from '../../../utils/mysql-queries';
import { checkProxy } from '.';

export const handleAddingProxy = async (
    mysql,
    proxy,
    ipWithoutProxy,
    logger,
) => {
    const proxyString = `${proxy.ip}:${proxy.port}`;
    const found = await findExistedProxy(mysql, proxyString, proxy.protocol);
    if (!found) {
        const result = await checkProxy(proxy, ipWithoutProxy, logger);
        await insertProxy(
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
