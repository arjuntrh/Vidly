const winston = require('winston');
const config = require('config');

function configuration() {
    if (!config.get('jwtPrivateKey')) {
        throw new error('FATAL ERROR: jwtPrivateKey not set');
    }
}

module.exports = configuration;