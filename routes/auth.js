const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi')
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const router = express.Router();

router.post('/', async (req, res) => {

    const { error } = validateCredentialsData(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    // check if the user already exists
    let user = await User.findOne({ email: req.body.email })
    if (!user)
        return res.status(400).send('Invalid email or password.');

    const result = await bcrypt.compare(req.body.password, user.password);

    // if (result)
    //     res.send('User Authenticated.');
    // else
    //     return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    res.send(token);
});

function validateCredentialsData(credentials) {
    const schema = {
        email: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(credentials, schema);
}

module.exports = router;