import winston from 'winston'

export const getTestLogger = (service: string) => {
  return winston.createLogger({
    defaultMeta: { service },
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console()],
  })
}
