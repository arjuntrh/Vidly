const express = require('express');
const  mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User, validateUser } = require('../models/user');

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);

  // check if the user already exists
  let user = await User.findOne({ email: req.body.email })
  
  if (user) 
    return res.status(400).send('User already registered.')

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  // hash the password using bcrypt before saving to db
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    const result = await user.save();
    const token = user.generateAuthToken();
    
    // send JWT to ensure user is logged in upon registration
    res.header('x-auth-token', token).send(_.pick(user, ['name', 'email']));
  }
  catch(ex) {
    res.status(500).send(ex.message);
  }
});

module.exports = router;