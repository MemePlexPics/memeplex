import winston from 'winston';
import process from 'process';

const { combine, timestamp, json, simple } = winston.format;

export const getLogger = (loggers, service) => {
    const transports = [
        new winston.transports.File({
            filename: `logs/${service}.log`,
            maxsize: 1024 * 1024 * 10, // bytes
            // maxFiles: 5,
            tailable: true,
        }),
    ];
    if (process.env.NODE_ENV !== 'production')
        transports.push(
            new winston.transports.Console({
                format: simple(),
            }),
        );

    loggers.add(service, {
        format: combine(timestamp(), json()),
        level: 'verbose',
        defaultMeta: { service },
        transports,
    });

    return loggers.get(service);
};
