const config = require('config');
const winston = require('winston');
const mongoose = require('mongoose');

function dbConnection() {
    const db = config.get('db');
    // const db = "mongodb+srv://hammerheadhh09:Nexus5%40xda*@vidly-bjgxf.mongodb.net/test?retryWrites=true"
    mongoose
        .connect(db, { useNewUrlParser: true, useCreateIndex: true })
        .then(() => {
            console.log(`Connected to ${db}...`);
        });
}

module.exports = dbConnection;