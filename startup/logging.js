require('express-async-errors');
const winston = require('winston');

function logging() {
    // using winston to write all errors to file
    // winston.add(new winston.transports.Console({ prettyPrint: true }));
    // winston.add(new winston.transports.File({ filename: 'logfile.log' }));

    // winston.exceptions.handle(new winston.transports.File({ filename: 'uncaughtExceptions.log' }));
    // winston.exceptions.handle(new winston.transports.Console({ prettyPrint: true }));

    process
        .on('unhandledRejection', (reason, p) => {
            console.error(reason, 'Unhandled Rejection at Promise', p);
        })
        .on('uncaughtException', err => {
            console.error(err, 'Uncaught Exception thrown');
            process.exit(1);
        });
}

module.exports = logging;