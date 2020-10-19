const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const { User } = require('../../../models/user');


describe('user.generateAuthToken', () => {
    it ('should return a valid JWT', () => {
        const payload = {
            _id: mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        }

        let user = new User(payload);

        const token = user.generateAuthToken();
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

        expect(decoded).toMatchObject(payload);
    })
})