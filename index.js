const express = require('express');
const winston = require('winston');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const app = express();

require('./startup/logging')();
require('./startup/config')();
require('./startup/db')(); 
require('./startup/routes')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;