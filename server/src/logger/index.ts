import winston from 'winston'

const loggerOption = (name: string): winston.LoggerOptions => ({
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: name }),
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console()
  ]
})

export function getLogger(name: string): winston.Logger {
  return winston.createLogger(loggerOption(name))
}
