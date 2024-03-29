import axios from 'axios';
import { insertProxyToRequest } from '.';
import { PROXY_TEST_TIMEOUT } from '../constants';

export const checkProxyAnonimity = async (ownIp, protocol, ip, port) => {
    try {
        const request = {
            url: 'https://ifconfig.me/all.json',
            method: 'GET',
            timeout: PROXY_TEST_TIMEOUT,
        };
        insertProxyToRequest(request, protocol, ip, port);
        const response = await axios(request);

        let hasOriginalIP = false;
        let hasProxyIndicator = false;
        Object.entries(response.headers).forEach(([header, value]) => {
            if (value.includes(ownIp)) {
                hasOriginalIP = true;
            }
            if (
                header.toLowerCase().includes('via') ||
                value.toLowerCase().includes('proxy')
            ) {
                hasProxyIndicator = true;
            }
        });

        if (hasOriginalIP) return 'transparent';
        if (hasProxyIndicator) return 'anonymous';
        return 'elite';
    } catch (error) {
        return null;
    }
};
