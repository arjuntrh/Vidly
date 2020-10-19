const winston = require('winston');
function errorHandler (err, req, res, next) {
    // winston.error(err.message, err);
    console.log(err.message);
    res.status(500).send('Something failed.');
}

module.exports = errorHandler;