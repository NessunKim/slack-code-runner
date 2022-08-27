import { createLogger, transports, format } from "winston";

interface TransformableInfo {
  level: string;
  message: string;
  label?: string;
  timestamp?: string;
  [key: string]: unknown;
}

const logger = createLogger({
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.Console({
      format: format.combine(
        format.label({ label: "[slack-code-runner]" }),
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.colorize(),
        format.printf(
          (info: TransformableInfo) =>
            `${info.timestamp} - ${info.level}: ${info.label} ${info.message}`
        )
      ),
    }),
  ],
});

export default logger;
