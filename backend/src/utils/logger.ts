import winston, { transports } from "winston";
const env = process.env;

const httpTransportOptions = {
  host: "http-intake.logs.us5.datadoghq.com",
  path: `/api/v2/logs?dd-api-key=${env.DATADOG_KEY}&ddsource=nodejs&service=${env.DATADOG_SERVICE}&version=${env.DATADOG_VERSION}`,
  ssl: true
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new transports.Http(httpTransportOptions)
  ]
});

export { logger };
