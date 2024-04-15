import winston, { Container } from 'winston'
import process from 'process'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'

const { combine, timestamp, json, simple } = winston.format

export const getLogger = (loggers: Container, service: string) => {
  const transports: (FileTransportInstance | ConsoleTransportInstance)[] = [
    new winston.transports.File({
      filename: `logs/${service}.log`,
      maxsize: 1024 * 1024 * 10, // bytes
      maxFiles: 99999,
      tailable: true,
    }),
  ]
  if (process.env.NODE_ENV !== 'production')
    transports.push(
      new winston.transports.Console({
        format: simple(),
      }),
    )

  loggers.add(service, {
    format: combine(timestamp(), json()),
    level: 'verbose',
    defaultMeta: { service },
    transports,
  })

  return loggers.get(service)
}
