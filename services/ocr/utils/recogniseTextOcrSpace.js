import { ocrSpace, handleTimeout } from './index.js';
import {
    chooseRandomOCRSpaceKey,
    getMysqlClient,
    dateToYyyyMmDdHhMmSs,
} from '../../../utils/index.js';
import {
    saveKeyTimeout,
    updateProxyAvailability,
} from '../../../utils/mysql-queries/index.js';
import { OCR_SPACE_403_DELAY } from '../../../constants/index.js';
import { InfoMessage } from '../../../utils/index.js';

export const recogniseTextOcrSpace = async (fileName, language, logger) => {
    let res;
    const {
        key: apiKey,
        timeout,
        proxy,
        protocol,
    } = await chooseRandomOCRSpaceKey();
    if (timeout) handleTimeout(apiKey, timeout, logger);
    try {
        const [host, port] = proxy.split(':');
        res = await ocrSpace(fileName, {
            apiKey,
            language,
            host,
            port,
            protocol,
            OCREngine: language == 'eng' ? '2' : '1',
            // see here for engine descriptions: http://ocr.space/OCRAPI
        });
        console.log('💬', res);
    } catch (error) {
        if (error?.response?.status === 403) {
            const newTimeout = dateToYyyyMmDdHhMmSs(
                Date.now() + OCR_SPACE_403_DELAY,
            );
            const mysql = await getMysqlClient();
            await saveKeyTimeout(mysql, apiKey, newTimeout);
            mysql.close();
            throw new InfoMessage(
                `❗️ 403 from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
            );
        }
        if (
            error.name === 'AxiosError' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ERR_BAD_REQUEST' ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'EHOSTUNREACH' ||
            error.message === 'socket hang up' ||
            error.message === 'Socket closed' ||
            error.message === 'Proxy connection timed out' ||
            error.message.startsWith('Socks5 proxy rejected connection') ||
            error.message.startsWith('connect ECONNREFUSED') // somehow this is not the same error as the error.code === 'ECONNREFUSED'
        ) {
            const mysql = await getMysqlClient();
            await updateProxyAvailability(mysql, proxy, protocol, false);
            mysql.close();
            throw new InfoMessage(
                `Proxy error:, «${error.code}» ${error.name} ${error.message}`,
            );
        }
        throw error;
    }

    if (res.IsErroredOnProcessing)
        throw new Error(res?.ErrorMessage?.join());

    if (!Array.isArray(res?.ParsedResults)) {
        const mysql = await getMysqlClient();
        await updateProxyAvailability(mysql, proxy, protocol, false);
        mysql.close();
        throw new InfoMessage(
            `Invalid res.ParsedResults, probably dead proxy ${proxy} (${protocol}). ${JSON.stringify(res)}`,
        );
    }
    const mysql = await getMysqlClient();
    await updateProxyAvailability(mysql, proxy, protocol, true);
    mysql.close();

    let text = [];
    for (const result of res.ParsedResults) {
        text.push(result.ParsedText.replace(/\r\n/g, ' '));
    }
    return text.join(' ');
};
