const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
       // new winston.transports.File({ filename: process.cwd() + '\\logs\\info.log',  timestamp: true}),
        new winston.transports.File({ filename: process.cwd() + '\\logs\\info.log',  timestamp: true})
    ]
});

logger.add(new winston.transports.Console({
  format: winston.format.simple()
}));

module.exports = logger;
